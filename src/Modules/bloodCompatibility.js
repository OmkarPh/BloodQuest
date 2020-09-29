let bloodTypes = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

let compatibleForYou = new Map([
    ["A+",  ["A+", "A-", "O+", "O-"]],
    ["A-",  ["A-,", "O-"]],
    ["B+",  ["B+", "B-", "O+", "O-"]],
    ["B-",  ["B-", "O-"]],
    ["O+",  ["O+", "O-"]],
    ["O-",  ["O-"]],
    ["AB+", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
    ["AB-", ["AB-", "O-", "A-", "B-"]],
]);

const getCompatible = async (needyBlood) => {
    if(typeof(needyBlood) == "number")
        needyBlood = bloodTypes[number];
    // console.log("Needy blood is ", needyBlood);
    // console.log("Compatibles: ", compatibleForYou.get(needyBlood));
    return compatibleForYou.get(needyBlood);
}

module.exports = getCompatible;