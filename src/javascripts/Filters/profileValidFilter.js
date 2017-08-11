export default function(ngapp) {
    ngapp.filter('profileValid', function() {
        return function(profiles) {
            return profiles.filter(function(profile) {
                return profile.valid && profile.name.length > 0;
            });
        }
    });
}
