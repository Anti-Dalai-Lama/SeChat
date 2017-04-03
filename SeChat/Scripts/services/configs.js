sechat.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/Go');

    $stateProvider

        .state('go', {
            url: '/Go',
            templateUrl: '../../ContentViews/Go.html',
            controller: 'goCtrl'
        })

        .state('main', {
            url: '/Main',
            templateUrl: '../../ContentViews/Main.html',
            controller: 'mainCtrl'
        });

});