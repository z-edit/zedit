ngapp.run(function(appModeService, loadOrderService) {
    appModeService.addLoader('storeLoadOrder', function() {
        loadOrderService.init();
        appModeService.goToAppView();
    });
});
