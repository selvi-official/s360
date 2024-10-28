# cli.py
import sys
from app import MyApp

def main():
    myapp = MyApp()
    myapp.inc_data_dump()

if __name__ == "__main__":
    main()
