var sum_to_n_a = function (n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function (n) {
    let res = (n * (n + 1)) / 2;
    return res;
};

var sum_to_n_c = function (n) {
    if (n === 1) return 1;
    let res = n + sum_to_n_c(n - 1);
    return res;
};