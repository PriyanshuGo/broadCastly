import Role from "../models/role.model.js";
import { PERMISSIONS } from "../constants/permissions.js";

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

export { seedRoles };
