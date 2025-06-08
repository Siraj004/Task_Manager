import { Role, Permission } from '../models';

export const seedRBAC = async () => {
  const roles = ['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer'];
  const permissions = [
    'user:manage', 'role:assign', 'project:create', 'project:delete',
    'task:create', 'task:edit', 'task:delete', 'task:view',
    'task:comment', 'task:test'
  ];

  try {
    // Create roles
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Create permissions
    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { name: perm },
        defaults: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Assign all permissions to Admin role
    const admin = await Role.findOne({ where: { name: 'Admin' } });
    const allPerms = await Permission.findAll();
    if (admin) {
      await admin.setPermissions(allPerms);
    }

    console.log('✅ RBAC seeding complete');
  } catch (error) {
    console.error('❌ Error during RBAC seeding:', error);
  }
};
