angular.module('app.controllers')
    .controller('LoginCtrl', function($ionicLoading, $rootScope, $scope, $http, $ionicLoading, VerifyPhone, $timeout, $ionicPlatform, $cordovaOauth, $cordovaInAppBrowser) {
    
        var permanentStorage = window.localStorage;
        init();

        $rootScope.showSpinner = function() {          
            console.log('show');
            $ionicLoading.show({
                content: 'Loading',
                 animation: 'fade-in'
            });
        }
        $rootScope.hideSpinner = function() {
            console.log('hide');
            $ionicLoading.hide();
        }
        
        function init() {
            
            $scope.callStatus = "You will receive a miss call from us in 30 sec"
            $scope.waitingForOTP = false;
            $scope.showCallCard = false;
            var verifiedNumber=permanentStorage.getItem("verifiedNumber");
            console.log('verifiedNumber:'+verifiedNumber );
            $scope.verifiedNumber = verifiedNumber==null?"Phone Number": verifiedNumber//read from db
            $scope.loaderPercent = 0;
            $scope.cnfIsDisabled = false;


            var fbData=JSON.parse(permanentStorage.getItem("fbData"));            
            $scope.fbData=fbData==null?{name:"Facebook",picture:{data:{url:""}}}:fbData;    

            var googleData=JSON.parse(permanentStorage.getItem("googleData")); 
            $scope.googleData=googleData==null?{displayName:"Google +",image:{url:""}}:googleData;    

            // $scope.twitterUsername = "Twitter";
        }

        $scope.toggle = function() {
            if ($scope.verifiedNumber === "Phone Number") {
                $scope.showCallCard = !$scope.showCallCard;
            } else
                $scope.showCallCard = false;

        };

        $scope.fb = function() {

            $cordovaOauth.facebook("119172011765640", ["public_profile", "email", "user_friends"]).then(function(result) {
                // $localStorage.accessToken = result.access_token;
                console.log('token: ' + JSON.stringify(result));
                $http.get("https://graph.facebook.com/v2.2/me", {
                    params: {
                        access_token: result.access_token,
                        fields: "id,name,gender,location,website,picture,relationship_status",
                        format: "json"
                    }
                }).then(function(result) {

                    console.log(JSON.stringify(result.data));
                    $scope.fbData=result.data;
                    permanentStorage.setItem("fbData", JSON.stringify(result.data));  //stored as string
                    //console.log(JSON.stringify(permanentStorage.getItem("fbData")));
                    // $scope.fbUsername = result.data.name;
                    // $scope.showFbPic = true;
                    // $scope.fbPic = result.data.picture.data.url;
                }, function(error) {
                    alert("There was a problem getting your profile.  Check the logs for details.");
                    console.log(error);
                });

            }, function(error) {
                alert("There was a problem signing in!  See the console for logs");
                console.log(error);
            });
        };

        $scope.google = function() {
            $cordovaOauth.google("435458489378-ekio6t44d0n3pjalonbikrq8m4m92f8a.apps.googleusercontent.com", ["profile", "email"]).then(function(result) {
                console.log('result:' + JSON.stringify(result));
                
                $http.get("https://www.googleapis.com/plus/v1/people/me", {
                    headers: {
                        'Authorization': 'Bearer ' + result.access_token
                    }
                }).then(function(result) {
                    
                    console.log(JSON.stringify(result.data));
                    $scope.googleData=result.data
                    permanentStorage.setItem("googleData", JSON.stringify(result.data));  //stored as string
                    
                }, function(error) {
                    alert("There was a problem getting your profile.  Check the logs for details.");
                    console.log('result:' + JSON.stringify(result));
                });

                //
            }, function(error) {
                console.log('error' + JSON.stringify(error));
            });
        }
        // $scope.twitter = function() {
        //     $cordovaOauth.twitter("NgzIAnwg4ubqMlJmP9YK70DTK", "Z3fw4xwjl2CAORNMG4ZUApwg8ZNLf5NgDSipmi5ubgDUX30F8b").then(function(result) {
        //         console.log('result:' + JSON.stringify(result));
        //         $scope.twitterUsername = result.screen_name;
        //         alert(JSON.stringify(result));

        //     }, function(error) {
        //         console.log('error: ' + error);
        //     });
        // }

        $scope.call = function() {
            //document.getElementById("number").value = '919535373749';

            $scope.app_id = 123;
            $scope.mobile = document.getElementById("number").value;
            console.log('mobile: ' + $scope.mobile);
            $scope.cnfIsDisabled = true;
            verify_1();
        }

        function verify_1() {

            if (ionic.Platform.isAndroid()) {

                $scope.callStatus = "Making network call";
                $scope.loaderPercent = 20;
                //window.plugins.phonenumber.get(success, failed);


                var callback = function(err, res) {
                    if (err)
                        _error(err);
                    else {
                        console.log('res ' + JSON.stringify(res));
                        $scope.callStatus = "Waiting for miss call";
                        $scope.loaderPercent = 40;

                        var _callback = function(otp) {
                            verify_2(res.keymatch, otp);
                        }
                        registerCallListener(_callback);

                        $timeout(function() {
                            deregisterCallListener();
                            console.log('deregistered');
                        }, 20000); ////keep listener on for 20 sec
                    }
                }
                VerifyPhone.getCall($scope.app_id, $scope.mobile, callback);
            } else {
                console.log('ios');
                $scope.callStatus = "Making network call";
                $scope.loaderPercent = 20;
                var callback = function(err, res) {
                    if (err)
                        _error(err);
                    else {
                        console.log('res ' + JSON.stringify(res));
                        $scope.callStatus = "Wait for miss call, Enter miss call number to verify";
                        document.getElementById("number").value = res.otp_start.substr(1);
                        $scope.loaderPercent = 40;
                        $scope.cnfIsDisabled = false;
                        $scope.waitingForOTP = true;
                        $scope.keymatch = res.keymatch;
                    }
                }

                VerifyPhone.getCall($scope.app_id, $scope.mobile, callback);

            }


        }
        $scope.verifyOTP = function() {
            console.log('sending otp');
            verify_2($scope.keymatch, document.getElementById("number").value);
            $scope.cnfIsDisabled = true;

        }

        function registerCallListener(callback) {
            window.PhoneCallTrap.onCall(function(state) {
                if (state.indexOf("RINGING") > -1) {
                    console.log("Phone is ringing:" + state.substr(9));
                    callback(state.substr(9)); //incoming num 
                }
            })
        }

        function deregisterCallListener() {
            window.PhoneCallTrap.onCall(function(state) {
                //
            })
        }


        function verify_2(keymatch, otp) {
            console.log('verify_2');
            $scope.callStatus = "Verifiying miss call number";
            $scope.loaderPercent = 70;
            console.log(keymatch);
            console.log(otp);
            var callback = function(err, res) {
                if (err)
                    _error(err);
                else
                    verified();
            }
            VerifyPhone.verifyCall($scope.app_id, keymatch, otp, callback)
        }

        function verified() {
            $scope.loaderPercent = 100;
            console.log('Thanks! Your number is verified');
            $scope.callStatus = "Verified";
            $scope.verifiedNumber = $scope.mobile;
            permanentStorage.setItem("verifiedNumber", $scope.verifiedNumber);
            $timeout(function() {
                $scope.showCallCard = false;
            }, 5000)
            
        }

        function _error(err) {
            $scope.waitingForOTP = false;
            $scope.cnfIsDisabled = false;
            $scope.callStatus = "Error, Please try again";
            console.log('_error: ' + err);
            $scope.loaderPercent = 0;

        }
    });
