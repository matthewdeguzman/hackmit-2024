from io import BytesIO
import time
from signal import pause
import os
from typing import Literal
import cv2
import requests as req
from gpiozero import LED, Button, TonalBuzzer
from gpiozero.tones import Tone
from html import escape

import base64

BASE_URL = "https://hackmit-2024-flame.vercel.app"
TOKEN="uxJhc-aPyr9BTaAeGPi4IY0Clg_UBVwirnnu1m3hnWA"

cam_port = 0
cam = cv2.VideoCapture(cam_port)

green, red = LED(23), LED(24)
CAPTURE = None

def setReady(ready: Literal['ready'] | Literal['wait']):
    if ready == 'ready':
        green.on()
        red.off()
    else:
        green.off()
        red.on()
    

# def cv2_to_base64(image):
#     return cv2.imencode('.jpg', image)[1]

def capture() -> str:
    global CAPTURE
    ret, CAPTURE = cam.read()
    if ret: 
        cv2.imwrite('capture.jpeg', CAPTURE)

        
def upload():
    global CAPTURE
    if (CAPTURE is not None):
        print("Uploading... ", end='', flush=True)
        with open('capture.jpeg', 'rb') as image_file:
            send = req.post("https://tmpfiles.org/api/v1/upload",
                            files={
                                'file': image_file
                            })
        
        url: str = send.json()['data']['url'].replace('.org/', '.org/dl/')
        
        resp = req.get(f"{BASE_URL}/api/create_event?url={escape(url)}",
                headers={
                    "Authorization": f"Bearer {TOKEN}",
                })
        print(f"DONE [{resp.status_code}]")
        print(resp.text)
    
def capture_and_upload():
    print("=> TRIGGERED!")
    
    setReady('wait')
    upload()
    setReady('ready')
    
    print("<= COMPLETE!\n")
    
        
if __name__ == "__main__":
    print("Starting... ", end='')
    capture()
    
    setReady('ready')
    
    button = Button(25, pull_up=True, bounce_time=.1)
    button.when_activated = capture_and_upload

    while True:
        capture()
    
    # buzzer = TonalBuzzer(16)
    # buzzer.play(Tone('A3'))
    # while True:
    #     input("Enter to test... ")
    #     capture_and_upload()
        
    
    print("DONE\n")
    pause()
