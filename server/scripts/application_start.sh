#!/bin/bash

echo 'run application_start.sh: ' >> /home/ec2-user/Overview/server/deploy.log
# nodejs-app is the same name as stored in pm2 process
echo 'pm2 restart nodejs-app' >> /home/ec2-user/Overview/server/deploy.log
pm2 restart server >> /home/ec2-user/Overview/server/deploy.log
