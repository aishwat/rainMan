angular.module('app.controllers')
    .controller('PredictionsCtrl', function($scope, $http, $ionicLoading, $timeout, $ionicSideMenuDelegate, $ionicPopup, ApiCall) {
        $scope.latLng;

        function reset() {
            $scope.latLng = "";
            $scope.footer = {};
            $scope.footer.container = {};
            $scope.footer.text = "";
            $scope.footer.container.show = false;
        }


        $scope.$watch(function() {
                return $ionicSideMenuDelegate.isOpen();
            },
            function(isOpen) {
                if (isOpen) {
                    console.log('open');
                    var menu = document.getElementById("menu");
                    menu.style.visibility = "visible";

                } else {
                    console.log('close');
                    var menu = document.getElementById("menu");
                    menu.style.visibility = "hidden";

                }
            }
        );

        $scope.$on('$ionicView.leave', function(viewInfo, state) { //to go to other views
            console.log('leave');
            var menu = document.getElementById("menu");
            menu.style.visibility = "visible";

        });

        $scope.$on('$ionicView.beforeEnter', function(viewInfo, state) { //failsafe for navigating back
            console.log('beforeEnter');
            var menu = document.getElementById("menu");
            menu.style.visibility = "hidden";

        });

        ionic.Platform.ready(initialize);

        function getIcons() {
            // put it on init
            var icons = new Skycons({
                    "color": "#F0F8FF",
                    "resizeClear": true
                }),
                list = [
                    "clear-day", "clear-night", "partly-cloudy-day",
                    "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
                    "fog"
                ],
                i;

            for (i = list.length; i--;)
                icons.set(list[i], list[i]);

            icons.play();
            //

        }

        function initialize() {
            getIcons();
            reset();
            $scope.footer.text = "Initializing...";
            var mapDiv = document.getElementById("map_canvas");
            $scope.map = plugin.google.maps.Map.getMap(mapDiv);
            $scope.map.on(plugin.google.maps.event.MAP_READY, onMapInit);
        }

        function onMapInit() {

            console.log('in map init');
            $scope.map.clear();
            $scope.map.setClickable(true);
            getCurrentLocation();
        }

        function setMarker() {

            $scope.map.clear();
            $scope.map.addMarker({
                    position: $scope.latLng,
                    icon: 'www/img/marker.png',
                    snippet: 'Latitude : ' + $scope.latLng.lat + '\nLongitude : ' + $scope.latLng.lng
                },
                function(marker) {
                    console.log('added marker');
                    // //
                    // $scope.map.setClickable(false);
                    // var confirmPopup = $ionicPopup.confirm({
                    //     title: 'Consume Ice Cream',
                    //     template: 'Are you sure you want to eat this ice cream?'
                    // });
                    // //
                    // confirmPopup.then(function(res) {
                    //     if (res) {
                    //         console.log('You are sure');
                    //         $scope.map.setClickable(true);
                    //     } else {
                    //         console.log('You are not sure');
                    //         $scope.map.setClickable(true);
                    //     }
                    // });
                    // //
                });
        }

        function getWeatherData() {
            var callback = function(err, res) {
                if (err)
                    alert('err:' + JSON.stringify(err)); //handle later
                else {

                    $timeout(function() {
                        console.log('res:' + res.currently.summary);
                        $scope.footer.text = "";
                        $scope.footer.container.show = true;
                        $scope.footer.container.data = res;
                        $scope.$apply();
                    }, 500);

                    // $scope.map.setClickable(false);
                    // $scope.map.remove();
                }
            }
            ApiCall.get($scope.latLng, callback);

        }

        function animateCamera() {
            $scope.map.animateCamera({
                'target': $scope.latLng,
                'zoom': 17
            }, function() {
                console.log('camera done');
                $timeout(function() {
                    $scope.footer.text = "Getting Weather Data...";
                    $scope.$apply();
                });

                //assuming marker is done by now
                getWeatherData();

            });
        }

        function getCurrentLocation() {
            $scope.footer.text = "Getting Location...";
            $scope.$apply();
            var onSuccess = function(location) {
                console.log('current location: ' + JSON.stringify(location));
                $scope.latLng = location.latLng;
                animateCamera();
                setMarker();
                // getAddressString($scope.latLng,setMarker);
            };
            var onError = function(err) {
                console.log('error:' + JSON.stringify(err)); // important handle later 
            };
            $scope.map.getMyLocation(onSuccess, onError);
        }

        $scope.clearText = function() {
            document.getElementById('txtSearch').value = "";
        }

        $scope.search = function() {

            var txtSearch = document.getElementById("txtSearch").value;
            console.log('in search:' + txtSearch);
            if (txtSearch != '') {
                $timeout(function() {
                    reset();
                    $scope.footer.text = "Getting Location...";
                    $scope.$apply();
                });

                plugin.google.maps.Geocoder.geocode({
                    'address': txtSearch
                }, function(results) {
                    if (results.length) {
                        var result = results[0];
                        $scope.latLng = result.position;
                        console.log('position:' + JSON.stringify(result));
                        animateCamera();
                        setMarker();

                    } else {
                        console.log('place not found');
                    }
                });
            }


        }
    });



// function getAddressString(latLng,callback) { //reverse geocode
//     var request = {
//         'position': latLng
//     };
//     plugin.google.maps.Geocoder.geocode(request, function(results) {
//         console.log('reverse geocode: ' + JSON.stringify(results[0]));
//         var res = results[0];

//         var address = '';

//         if (res.hasOwnProperty('subLocality'))
//             address = address + res.subLocality + '\n';
//         if (res.hasOwnProperty('thoroughfare'))
//             address = address + res.thoroughfare + '\n';
//         if (res.hasOwnProperty('locality'))
//             address = address + res.locality + '\n';
//         if (res.hasOwnProperty('postalCode'))
//             address = address + res.postalCode;
//         callback(address);
//     });
// }
