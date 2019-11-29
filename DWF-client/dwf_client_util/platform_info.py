import platform
from cpuinfo import get_cpu_info_json
import json
from shutil import which
import nvgpu
from psutil import virtual_memory
from hurry.filesize import size 

def get_gpu_info():
    if which('nvidia-smi') is not None:
        return json.dumps(nvgpu.gpu_info())
    else:
        return json.dumps(["Couldn't retrieve GPU information - probably not nvidia card."]) 

def get_platform_info():
    platform_info = {}
    platform_info['node'] = platform.node()
    platform_info['os'] = platform.platform()
    
    cpu_info = json.loads(get_cpu_info_json())
    platform_info['cpu'] = {}
    platform_info['cpu']['brand'] = cpu_info['brand']
    platform_info['cpu']['clock_speed'] = cpu_info['hz_actual']
    platform_info['cpu']['cores'] = cpu_info['count']

    platform_info['gpu_json_str'] = get_gpu_info()

    platform_info['memory'] = size(virtual_memory().total)

    return platform_info