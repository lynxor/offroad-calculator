function angle(h, d) {
    var c = Math.sqrt(h * h + d * d),
        sinA = Math.sin(toRadian(90)) * h / c;
    return toDegree(Math.asin(sinA));
}

function angle2(h, d) {
    var c = Math.sqrt(h * h + d * d),
        cosA = ( (d * d) + (c * c) - (h * h) ) / (2 * d * c);
    return toDegree(Math.acos(cosA));
}

function breakover(h, d) {
    var c = Math.sqrt(sqr(h) + sqr(d / 2)),
        cosA = ( sqr(d / 2) + sqr(c) - sqr(h)) / (2 * (d / 2) * c);

    return 180 - (2 * (90 - toDegree(Math.acos(cosA))));
}

function sqr(a) {
    return Math.pow(a, 2);
}

function toDegree(rad) {
    return rad * 180 / Math.PI;
}

function toRadian(deg) {
    return deg / 180 * Math.PI;
}