from datetime import datetime
import time


def timestamp_ms():
    return str(int(time.mktime(datetime.now().timetuple())) * 1000)
