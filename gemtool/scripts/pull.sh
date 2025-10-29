#!/bin/bash

source /home/ubuntu/mekong-xray/venv/bin/activate
cd /home/ubuntu/mekong-xray/mekong-xray
git reset --hard HEAD
git pull
python manage.py collectstatic
sudo systemctl restart emperor.uwsgi.service
sudo service nginx restart
