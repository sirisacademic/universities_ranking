'use strict';

describe('Directive: tableview', function () {

  // load the directive's module
  beforeEach(module('arwuApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tableview></tableview>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tableview directive');
  }));
});
