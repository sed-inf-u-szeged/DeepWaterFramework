from multiprocessing import Process
import logging
import traceback
from time import sleep
import sys
from multiprocessing import Process, Value, Pipe
from abc import abstractmethod

import dwf_client_util.util as util
import dwf_client_util.server as server
import dwf_client_util.task_manager as task_manager
ClientStatus = util.ClientStatus
Signals = util.Signals

class SafeProcess(Process):
    def __init__(self, client_id, name, debug = False, *args, **kwargs):
        super(SafeProcess, self).__init__(*args, **kwargs)
        logging.basicConfig(format=f'%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)
        self.name = name
        self.debug = debug
        self.client_id = client_id

    def run(self):
        try:
            Process.run(self)
        except ConnectionError as e:
            logging.info(f"Can't connect to server. Error message: \n {str(e)}\n Client is exiting...")
            if self.debug:
                logging.info(traceback.format_exc())

            sys.exit(-1)

        except KeyError:
            logging.info("Worker id is unknown, try running the client with the --reinit argument.")
            if self.debug:
                logging.info(traceback.format_exc())

            sys.exit(-1)

        except Exception as e:
            logging.info(f"Unhandled exception occured:\n{str(e)} \n Client is exiting...")
            server.send_to_endpoint('ERROR', {"hash": self.client_id, "log": f"Unhandled exception: {str(e)}"})
            if self.debug:
                logging.info(traceback.format_exc())
            sys.exit(-1)

        except KeyboardInterrupt:
            if self.debug:
                logging.info(f"[{self.name}] Keyboard interruption, process is exiting...")
                logging.info(traceback.format_exc())

            sys.exit(0)



class BaseWorker():
    def __init__(self, client_id, name, debug):
        self.client_id = client_id
        self.name = name
        self.debug = debug
        self.active_process = None
        self.target_func_args = ()


    @abstractmethod
    def target_func(self):
        pass

    def is_alive(self):
        return self.active_process.is_alive()

    def launch(self):
        self.active_process = SafeProcess(self.client_id, self.name, self.debug, target=self.target_func, args=self.target_func_args)
        self.active_process.start()

    def stop(self):
        self.active_process.terminate()
        self.active_process.join()


class Pinger(BaseWorker):
    def __init__(self, client_id, stop_task_signal, client_status, debug = False):
        super(Pinger, self).__init__(client_id, "PINGER", debug)
        self.stop_task_signal = stop_task_signal
        self.client_status = client_status

        logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)

    def _is_stop(self, response):
        return not response.json()['working'] and self.client_status.value == ClientStatus.WORKING
    
    def target_func(self):
        while True:
            resp = server.send_to_endpoint('PING', {'hash': self.client_id})
            if self._is_stop(resp):
                logging.info(f"Received stop command from server!")
                self.stop_task_signal.send(Signals.STOP_TASK)

            sleep(util.config['PING_INTVAL'])
    

class TaskWorker(BaseWorker):
    def __init__(self, client_id, client_status, debug = False):
        super(TaskWorker, self).__init__(client_id, "TASK WORKER", debug)
        self.client_status = client_status
        logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)

    def _process_task(self, task):
        try:
            logging.info(f'New task assigned:\n {task}')
            task_manager.process_task(task)
            logging.info("Task is done.")
            self.client_status.value = ClientStatus.IDLE

        except Exception as e:
            logging.info(f"Task can't be completed, error occured: {str(e)}")
            if self.debug:
                logging.info(traceback.format_exc())

            server.send_to_endpoint('ERROR', {"hash": self.client_id, "log": f"Error: {str(e)} \n Task: {str(task)}."})
            return


    def target_func(self):
        while True:
            task = server.request_task(self.client_id)

            if not task:
                self.client_status.value = ClientStatus.IDLE
                logging.info(f"No task available. Retrying in {util.config['RETRY_INTVAL']}s...")
                sleep(util.config['RETRY_INTVAL'])

            else:
                self.client_status.value = ClientStatus.WORKING
                self._process_task(task)


        
class ProcessManager():
    def __init__(self, client_id, debug = False):
        self.client_id = client_id
        self.client_status = Value("i", ClientStatus.IDLE)
        self.parent_conn, self.child_conn = Pipe()
        self.pinger = Pinger(client_id, self.child_conn, self.client_status)
        self.task_worker = TaskWorker(client_id, self.client_status, debug)

    def _are_processes_alive(self, processes):
        for process in processes:
            if not process.is_alive():
                    other_processes = list(filter(lambda p: p != process, processes))
                    for other_process in other_processes:
                        other_process.stop()
                    logging.info("Client is exiting...")
                    return False
        return True


    def launch(self):
        self.task_worker.launch()
        self.pinger.launch()

        while True:
            if not self._are_processes_alive([self.task_worker, self.pinger]):
                return 
            if self.parent_conn.poll(1):
                self.parent_conn.recv()
                logging.info("Stopping task...")
                self.task_worker.stop()
                self.task_worker.launch()