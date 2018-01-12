#!/bin/bash
nyc report --reporter=text-summary
nyc report --reporter=lcov
nyc check-coverage --statements 100 --branches 100 --functions 100 --lines 100

if [[ $? == 1 ]]; then
  echo 'To see the test coverage report: \n\n  nyc report --reporter=html && open coverage/index.html\n';
  exit 1
fi
