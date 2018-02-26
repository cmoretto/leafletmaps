var init_datatable = (function ($) {
    $.fn.dataTable.ext.errMode = 'none';

    'use strict';
    var _self = {};
    _self.init = function ($table, data) {
        var json = data;

        if (data_table){
            data_table.destroy();
            $table.empty();
        }

        data_table = $table.DataTable({
            data: data,
            "columns" : [
                { "data" : "properties.name" },
                { "data" : "properties.density" }
            ],
            scrollX: true,
            scrollY: "325px", 
            scrollCollapse: true
        });

        
    };
    return {
        init: _self.init
    };
})(jQuery);