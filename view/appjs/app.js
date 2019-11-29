/**
     * Here Using angularjs for front-end
     * UserController this controller use for manage DataTables and DatePicker    
    */

var app = angular.module('NodeApp', [])
app.controller('UserController', function ($scope, $compile) {
    $scope.init = function () {
        $scope.lstSearchType = [{
            name: 'Daily'
        }, {
            name: 'Weekly'
        }, {
            name: 'Monthly'
        }]
        $scope.modelSearch = {
            StartDate: moment(),
            EndDate: moment(),
            SarchType: 'Daily'
        }
    }

    $(document).ready(function () {
        var t = $('#UserTable').DataTable({
            "processing": true,
            "serverSide": true,
            "responsive": true,
            "aaSorting": [0, 'desc'],
            "lengthMenu": [10, 20, 50, 75, 100],
            "iDisplayLength": 100,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            'ajax': {
                'type': 'Get',
                'url': 'http://localhost:5500/api/get-user',
                data: function (d) {
                    var SDate = new Date($scope.modelSearch.StartDate);
                    var EDate = new Date($scope.modelSearch.EndDate);
                    d.StartDate = moment(SDate).set({ hour: 0, minute: 0, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
                    d.EndDate = moment(EDate).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm:ss');
                    console.log(d)
                    return d;
                },
                'dataSrc': function (json) {
                    console.log(json)
                    $scope.TotalUsers = json.TotalUsers
                    json.recordsTotal = json.TotalRecords;
                    json.recordsFiltered = json.TotalRecords;
                    $scope.$apply();
                    return json.data
                }
            },
            'columns':
                [
                    { 'data': 'UserName' },
                    {
                        "data": null,
                        "sClass": "text-center",

                    },
                ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columnDefs": [
                {
                    "render": function (data, type, full, meta) {
                        if (full.userViews.length) {
                            return full.userViews.length;
                        }
                        else {
                            return 0;
                        }
                    },
                    "targets": 1
                },
                {
                    "render": function (data, type, full, meta) {
                        if (full.productsList.length) {
                            return full.productsList.length;
                        }
                        else {
                            return 0;
                        }
                    },
                    "targets": 2
                },
                {
                    "searchable": false,
                    "orderable": false,
                    "targets": 0
                }
            ]

        });

    });

    $scope.Search = function (Type) {
        if (Type == "Daily") {
            $scope.modelSearch.StartDate = moment()
            $scope.modelSearch.EndDate = moment()
        } else if (Type == "Weekly") {
            $scope.modelSearch.StartDate = moment().subtract(1, 'weeks').format('YYYY-MM-DD')
            $scope.modelSearch.EndDate = moment()
        } else if (Type == "Monthly") {
            $scope.modelSearch.StartDate = moment().subtract(1, 'months').format('YYYY-MM-DD')
            $scope.modelSearch.EndDate = moment()
        }
        $('#UserTable').dataTable()._fnAjaxUpdate();
    }
    $scope.init()

})
app.directive('datePicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ctrl) {

            // Format date on load
            ctrl.$formatters.unshift(function (value) {
                if (value && moment(value).isValid()) {
                    return moment(new Date(value)).format('MM/DD/YYYY');
                }
                console.log(value)
                return value;
            })

            //Disable Calendar
            scope.$watch(attr.ngDisabled, function (newVal) {
                if (newVal === true)
                    $(elm).datepicker("disable");
                else
                    $(elm).datepicker("enable");
            });

            // Datepicker Settings
            elm.datepicker({
                autoSize: true,
                changeYear: true,
                changeMonth: true,
                dateFormat: attr["dateformat"] || 'mm/dd/yy',
                showOn: 'button',
                buttonText: '<i class="glyphicon glyphicon-calendar"></i>',
                onSelect: function (valu) {
                    scope.$apply(function () {
                        ctrl.$setViewValue(valu);
                    });
                    elm.focus();
                },

                beforeShow: function () {
                    debugger;
                    if (attr["minDate"] != null)
                        $(elm).datepicker('option', 'minDate', attr["minDate"]);

                    if (attr["maxDate"] != null)
                        $(elm).datepicker('option', 'maxDate', attr["maxDate"]);
                },


            });
        }
    }
});
