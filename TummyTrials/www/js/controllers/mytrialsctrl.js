// Rules for ending the trial.
// User cannot abandon trial on or after the last day of trial. 
// If day is past the last day of trial, end trial. 
// If day is last day of trial, allow for completing trial after the noon reminder.



(angular.module('tummytrials.mytrialsctrl',
                ['tummytrials.lc','tummytrials.text', 'ionic', 'tummytrials.experiments'])

.controller('MyTrialsCtrl', function($scope, $state, $timeout, TextR, LC, $ionicPopup, Experiments, ExperimentsR) {
    $scope.text = TextR;
    Experiments.set_study_context($scope, ExperimentsR);
})

.controller('MyCrntTrialsCtrl', function($scope, $state, $timeout, TextR, LC, $ionicPopup, Experiments, ExperimentsR) {

  // An elaborate, custom popup to abandon ongoing trial
    $scope.abandon_trial = function(){
      $scope.reason = {};
        var cur = $scope.study_current;
        var status = null;
        if(cur.status == "active"){
              var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="reason.abandon">',
                title: 'Abandon trial',
                subTitle: 'Are you sure you want to abandon this trial? If so, please state your reason for abandoning.',
                scope: $scope,
                buttons: [
                  { text: 'Continue Trial' },
                  {
                    text: '<b>Abandon</b>',
                    type: 'button-royal',
                    onTap: function(e) {
                       if (!$scope.reason.abandon) {
                         //don't allow the user to close unless she enters the reason
                         e.preventDefault();
                       } else {
                         return $scope.reason.abandon;
                       }
                    }
                  }
                ]
              });

              myPopup.then(function(res) {
                    if(res) {
                        var status = "abandoned";
                        var reason = $scope.reason.abandon;
                        $ionicPopup.alert({
                            title: 'Abandon successful',
                            template: 'The ' + cur.trigger + ' trial has been abandoned.'
                        });
                        return Experiments.setAbandon_p(cur.id, status, reason)
                          .then(function(_){
                                $state.go('mytrials');
                          });
                     } else {
                     }
              })
              
            // }
      } else {
        // $scope.cur_exp = false;
      }
    };

    $scope.complete_trial = function(){
        var cur = $scope.study_current;
        if(cur.status == "active"){
            return Experiments.setStatus(cur.id, "ended")
            .then(function(_){
              $state.go('mytrials');
            });
        }
    };

    $scope.text = TextR;
    Experiments.set_study_context($scope, ExperimentsR);
      var cur =  $scope.study_current;

      var start_day = cur.name;
      $scope.start_day = start_day.replace("Trial beginning ", "");

      $scope.sym = cur.symptoms;

      //end_time is the last day + 1
      var not_end_date = cur.end_time;
      var end_date = not_end_date - 86400;
      var today = Math.round(Date.now()/1000);
      var complete = false , abandon = false;

      //experiment has elapsed
      if(today > not_end_date){
        complete = true;
      } else if(today >= end_date && today <= not_end_date){
        // this is the last day of the trial
        // check for evening reminder or check if values exist
        var last_report = cur.reports[Experiments.study_duration(cur) - 1];
        if(last_report.breakfast_compliance == false){
          // if complaince is false then last day report is over
          complete = true;
        } else if(last_report.breakfast_compliance == true){
            if(typeof(last_report.symptom_scores) == "object"){
            // if compliance was true check if scores reported.
            complete = true;
            }
        }
      } else if(today < end_date){
        //experiment still on going
        abandon = true;
      }

      $scope.comp = complete;
      $scope.abdn = abandon;

})

);
