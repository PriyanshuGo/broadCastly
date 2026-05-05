const Role = require("../models/role.model");
const { PERMISSIONS } = require("../constants/permissions");

const seedRoles = async () => {
  const roles = [
    {
      name: "teacher",
      permissions: [
        PERMISSIONS.CONTENT_CREATE,
        PERMISSIONS.CONTENT_VIEW_OWN,
      ],
    },
    {
      name: "principal",
      permissions: [
        PERMISSIONS.CONTENT_VIEW_ALL,
        PERMISSIONS.CONTENT_APPROVE,
        PERMISSIONS.CONTENT_REJECT,
      ],
    },
  ];

  for (const role of roles) {
    const exists = await Role.findOne({ name: role.name });

    if (!exists) {
      await Role.create(role);
      console.log(`${role.name} created`);
    }
  }
};

module.exports = { seedRoles };