var treadOptions = _.range(135, 356, 10),
    profileOptions = _.range(30, 86, 5),
    rimOptions = _.range(10, 24);

function tyreDiameter(tread, profile, rim) {
    return inchToMm(rim) + 2 * ( tread * profile / 100 );
}

function inchToMm(i){
    return i * 25.4;
}

function mmToInch(m){
    return m / 25.4;
}

