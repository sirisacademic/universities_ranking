'use strict';

describe('Directive: parallel', function () {

  // load the directive's module
  beforeEach(module('arwuApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<parallel></parallel>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the parallel directive');
  }));
});
