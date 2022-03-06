#!/bin/bash

source /home/ubuntu/gemtool/venv/bin/activate
cd /home/ubuntu/gemtool/gemtool
git reset --hard HEAD
git pull
python manage.py collectstatic
sudo systemctl restart emperor.uwsgi.service
sudo service nginx restart