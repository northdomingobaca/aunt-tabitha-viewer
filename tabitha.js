'use strict';

var gotta_go_fast = false;
var testday = "2015-01-17";
var max_results = 13;
var start_margin = 60;
var end_margin = 0;

function time_12(time) {
  time = time.split(":");
  time[0] = parseInt(time[0]);
  var suffix = "";
  if (time[0] < 12) {
    suffix = "a";
  } else {
    suffix = "p";
  }
  if (time[0] == 0) {
    time[0] = 12;
  } else if (time[0] > 12) {
    time[0] -= 12;
  }
  return time[0] + ":" + time[1] + suffix
}

function cur_time() {
  var time = new Date().toTimeString().split(':');
  return time[0] + ":" + time[1]
}

angular.module('app', [])

.controller('schedule', function($scope, $timeout, Schedule) {
  Schedule.get().then(function(response) {
    var day = new Date().toISOString().split('T')[0];
    if (gotta_go_fast) {
      $scope.schedule = response.data[testday];
    } else {
      $scope.schedule = response.data[day];
    }
    start_margin = $scope.schedule.start_margin;
    end_margin = $scope.schedule.end_margin;
  });
  $scope.time_12 = time_12;
  $scope.testing = gotta_go_fast;
  $scope.blah = 0;
  if (gotta_go_fast) {
    $scope.blah = 480;
    var h = Math.floor($scope.blah/60);
    var m = ($scope.blah % 60);
    $scope.current_time = (h < 10 ? '0' : '') + h + ":" + (m < 10 ? '0' : '') + m
  } else {
    $scope.current_time = cur_time();
  }

  function updateTest() {
    if (gotta_go_fast) {
      if ($scope.blah > 1260) {
        $scope.blah = 480;
      } else {
        $scope.blah += 1;
      }
      var h = Math.floor($scope.blah/60);
      var m = ($scope.blah % 60);
      $scope.current_time = (h < 10 ? '0' : '') + h + ":" + (m < 10 ? '0' : '') + m
      $timeout(updateTest, 20);
    } else {
      $scope.current_time = cur_time();
      $timeout(updateTest, 5000);
    }
  }

  $timeout(updateTest, 20);

})

.service('Schedule', function($http) {
  this.get = function() {
    return $http.get('schedule.json');
  }
})

.filter('future', function() {
  return function(items, blah) {
    if (!items) return;

    var now = 0;
    if (gotta_go_fast) {
      now = blah;
    }
    else {
      now = absoluteMinutes((new Date()).toTimeString());
    }

    var matches = items.filter(function(item) {
      var begin = absoluteMinutes(item.begin);
      var end = absoluteMinutes(item.end);
      return (now >= (begin - start_margin) && now <= (end + end_margin));
      //return true;
    });

    return matches;
  }
})

function absoluteMinutes(string) {
  var segments = string.split(":").map(function(item) {
    return parseInt(item);
  });
  return (segments[0] * 60) + segments[1];
}