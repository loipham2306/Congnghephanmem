// ========================================================
// CONSTANT: VAI TRÒ NGƯỜI DÙNG (RBAC)
// ========================================================

const ROLES = Object.freeze({
    ADMIN: "Admin",
    BACSI: "BacSi",
    YTA: "YTa",
    LETAN: "LeTan",
    BENHNHAN: "BenhNhan",
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));
const STAFF_ROLES = Object.freeze([ROLES.ADMIN, ROLES.BACSI, ROLES.LETAN, ROLES.YTA]);
const CLINICAL_ROLES = Object.freeze([ROLES.ADMIN, ROLES.BACSI]);
const RECEPTION_ROLES = Object.freeze([ROLES.ADMIN, ROLES.LETAN]);

module.exports = {
    ROLES,
    ALL_ROLES,
    STAFF_ROLES,
    CLINICAL_ROLES,
    RECEPTION_ROLES,
};
