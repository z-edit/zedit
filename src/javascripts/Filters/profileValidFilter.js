ngapp.filter('profileValid', function() {
    return function(profiles) {
        if (!profiles) return;
        return profiles.filter(profile => {
            return profile.valid && profile.name.length > 0;
        });
    }
});
