angular.module('app.services', [])
    .factory('ApiCall', function($http) {

        return {
            get: function(latLng, callback) {
                //later make server call
                var url = "https://api.forecast.io/forecast/e484166ba170e8de0b3f2093befb29b9/" + latLng.lat + "," + latLng.lng
                    //console.log('url: '+url);
                var test_url = '/epoch';

                $http.get(test_url,{timeout:15000}).then(function(resp) {
                    //console.log(JSON.stringify(resp));
                    if (resp.status == 200) {
                        callback(null, resp.data);
                        console.log('callback executed');
                    } else
                        callback('Response not 200 ', resp.status);
                }, function(err) {
                    callback('ERR', JSON.stringify(err));

                });


            }
        };
    })
    .factory('VerifyPhone', function($http, $timeout) {

        return {
            getCall: function(app_id, mobile, callback) {
                var url = "https://rain-man.herokuapp.com/getCall"

                var config = {
                    headers: {
                        // 'Accept': 'application/json'
                    },
                    params: {
                        app_id: app_id,
                        mobile: mobile
                    },
                    timeout:15000 
                };

                $http.get(url, config).then(function(resp) {

                    if (resp.status == 200 && resp.data.status == 'success') {
                        callback(null, resp.data);
                    } else
                        callback(JSON.stringify(resp.data));
                }, function(err) {

                    callback(JSON.stringify(err));

                });




            },
            verifyCall: function(app_id, keymatch, otp, callback) {
                var url = "https://rain-man.herokuapp.com/verifyCall"

                var config = {
                    headers: {
                        // 'Accept': 'application/json'
                    },
                    params: {
                        app_id: app_id,
                        keymatch: keymatch,
                        otp: otp
                    },
                    timeout:15000
                };

                $http.get(url, config).then(function(resp) {
                    //console.log('callback executed' + resp);
                    //console.log(JSON.stringify(resp));
                    if (resp.status === 200 && resp.data.status != 'failed') {
                        callback(null, resp.data);
                    } else
                        callback(JSON.stringify(resp.data.errors));
                }, function(err) {

                    callback(JSON.stringify(err));

                });



            }

        };
    });
