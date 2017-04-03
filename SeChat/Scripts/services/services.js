sechat
    .factory('sechatApi', function ($q, $http) {
    
        var sechatApi = {};


        sechatApi.getCurState = function () {
            for (var i = 0; i < sechatApi.currentstate.length; i++) {
                if (sechatApi.currentstate[i].isActive == true) {
                    return sechatApi.currentstate[i].state;
                }
            }
        };

        sechatApi.setCurState = function (param) {
            for (var i = 0; i < sechatApi.currentstate.length; i++) {
                if (sechatApi.currentstate[i].state == param) {
                    return sechatApi.currentstate[i].isActive = true;
                }
                else {
                    sechatApi.currentstate[i].isActive = false;
                }
            }
        };

        sechatApi.showHideMenu = function () {
            $('.header').toggleClass('opened-menu');
            $('.content').toggleClass('opened-menu');
            $('.dark-div').toggleClass('opened-menu');
        };

        //korgieApi.getContacts = function () {
        //    var deferred = $q.defer();
        //    $http.get('/Event/GetContacts').then(function successCallback(response) {
        //        korgieApi.contacts = response.data;
        //        deferred.resolve(response.data);
        //    });
        //    return deferred.promise;
        //};

        //korgieApi.getProfileInfo = function () {
        //    var deferred = $q.defer();
        //    $http.get('/Event/GetProfileInfo').then(function successCallback(response) {
        //        var data = response.data;
        //        korgieApi.name = data.Name;
        //        korgieApi.primaryEmail = data.PrimaryEmail;
        //        korgieApi.additionalEmail = data.AdditionalEmail;
        //        korgieApi.phone = data.Phone;
        //        korgieApi.country = data.Country;
        //        korgieApi.city = data.City;
        //        if (data.Sport.length == 3)
        //            korgieApi.sport = data.Sport;
        //        if (data.Work.length == 3)
        //            korgieApi.work = data.Work;
        //        if (data.Rest.length == 3)
        //            korgieApi.rest = data.Rest;
        //        if (data.Study.length == 3)
        //            korgieApi.study = data.Study;
        //        if (data.Additional.length == 3)
        //            korgieApi.additional = data.Additional;
        //        deferred.resolve();
        //    }, function errorCallback(response) {
        //        deferred.reject();
        //    });
        //    return deferred.promise;
        //};

        return sechatApi;
});
