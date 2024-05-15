#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/Overview/server/deploy.log

echo 'cd /home/ec2-user/Overview/server' >> /home/ec2-user/Overview/server/deploy.log
cd /home/ec2-user/Overview/server >> /home/ec2-user/Overview/server/deploy.log

echo 'npm install' >> /home/ec2-user/Overview/server/deploy.log 
npm install >> /home/ec2-user/Overview/server/deploy.log

echo 'npm run build' >> /home/ec2-user/Overview/server/deploy.log
npm run build >> /home/ec2-user/Overview/server/deploy.log

