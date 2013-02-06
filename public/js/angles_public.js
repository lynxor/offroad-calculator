$(function () {
    var aheight$ = $("#aheight"),
        adistance$ = $("#adistance"),
        aresult$ = $("#aresult"),
        dheight$ = $("#dheight"),
        ddistance$ = $("#ddistance"),
        dresult$ = $("#dresult"),
        bheight$ = $("#bheight"),
        bdistance$ = $("#bdistance"),
        bresult$ = $("#bresult"),
        auresult$ = $("#auresult"),
        buresult$ = $("#buresult"),
        duresult$ = $("#duresult"),
        lift$ = $("#lift"),
        oTyreDim, uTyreDim;

    function getLift() {
        var lift = parseFloat(lift$.val());
        if (_.isFinite(uTyreDim) && _.isFinite(oTyreDim)) {
            lift += (uTyreDim - oTyreDim) / 2;
        }
        return lift;
    }

    function calculate(h, d, lift, resultHandler) {
        var height = parseFloat(h.val()) + (lift || 0),
            distance = parseFloat(d.val()),
            resultA = angle(height, distance);
        resultHandler(resultA);
    }

    function calculateBreakover(lift, resultHandler) {
        var height = parseFloat(bheight$.val()) + (lift || 0),
            distance = parseFloat(bdistance$.val()),
            resultA = breakover(height, distance);
        return resultHandler(resultA);
    }

    _.each([aheight$, adistance$], function (inp) {
        inp.change(function () {
            calculate(aheight$, adistance$, 0, function (angle) {
                aresult$.html(resultHtml(angle));
                renderUpgrade();
            });
        });
    });
    _.each([dheight$, ddistance$], function (inp) {
        inp.change(function () {
            calculate(dheight$, ddistance$, 0, function (angle) {
                dresult$.html(resultHtml(angle));
                renderUpgrade();
            });
        });
    });
    _.each([bheight$, bdistance$], function (inp) {
        inp.change(function () {
            calculateBreakover(0, function (angle) {
                bresult$.html(resultHtml(angle));
                renderUpgrade();
            });
        });
    });
    calculate(aheight$, adistance$, 0, function (angle) {
        aresult$.html(resultHtml(angle));
    });
    calculate(dheight$, ddistance$, 0, function (angle) {
        dresult$.html(resultHtml(angle));
    });
    calculateBreakover(0, function (angle) {
        bresult$.html(resultHtml(angle));
    });
    renderUpgrade();
    var original_tyre = addTyre($("#original_tyre"), {name:"original", tread:255, profile:70, rim:16}, function (diameter) {
            oTyreDim = diameter;
            renderUpgrade();
        }),
        upgrade_tyre = addTyre($("#new_tyre"), {name:"upgrade", tread:265, profile:70, rim:16}, function (diameter) {
            uTyreDim = diameter;
            renderUpgrade();
        });
    lift$.change(renderUpgrade);
    function renderUpgrade() {
        var lift = getLift();
        calculate(aheight$, adistance$, lift, function (angle) {
            auresult$.html(resultHtml(angle));
        });
        calculate(dheight$, ddistance$, lift, function (angle) {
            duresult$.html(resultHtml(angle));
        });
        calculateBreakover(lift, function (angle) {
            buresult$.html(resultHtml(angle));
        });
    }
});
function resultHtml(angle) {
    return _.template("Result: <span style='font-weight: bold; color: #2e8b57;'> <%= angle %> </span>")({angle:angle.toFixed(2)});
}
