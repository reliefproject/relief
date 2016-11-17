app.directive('closedropdown', $document => {
  return {
    link: (scope, element) => {
      element.data('dropdown', true);
      angular.element($document[0].body).on('click', e => {
        const inThing =  angular.element(e.target).inheritedData('dropdown');
        // Close dropdown menu when clicking outside of it
        if (!inThing) {
          scope.showAppMenu = false;
          scope.$apply();
        }
      });
    },
  };
});
