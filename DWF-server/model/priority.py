class Priority:
    LOW = 0
    NORMAL = 1
    HIGH = 2
    IMMEDIATE = 3

    @staticmethod
    def to_str(priority):
        if priority == Priority.LOW:
            return "LOW"

        elif priority == Priority.NORMAL:
            return "NORMAL"

        elif priority == Priority.HIGH:
            return "HIGH"

        elif priority == Priority.IMMEDIATE:
            return "IMMEDIATE"

        else:
            return "UNKNOWN"
