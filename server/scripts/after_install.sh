#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/Overview/deploy.log

echo 'cd /home/ec2-user/Overview' >> /home/ec2-user/Overview/deploy.log
cd /home/ec2-user/Overview >> /home/ec2-user/Overview/deploy.log

echo 'npm install' >> /home/ec2-user/Overview/deploy.log 
npm install >> /home/ec2-user/Overview/deploy.log

