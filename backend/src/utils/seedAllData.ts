// src/utils/seedAllData.ts
import User from '../models/User';
import { Role, Project, Task, Comment } from '../models';
import bcrypt from 'bcrypt';

export const seedAllData = async () => {
  console.log('🔁 Seeding all data...');

  // 1. Create Roles if not already created
  const roles = ['Admin', 'Project Manager', 'Developer', 'Tester', 'Viewer'];
  for (const name of roles) {
    await Role.findOrCreate({ where: { name } });
  }
  console.log('✅ Roles seeded');

  // 2. Create Users
  const usersData = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'manager', password: 'manager123', role: 'Project Manager' },
    { username: 'dev', password: 'dev123', role: 'Developer' },
    { username: 'tester', password: 'tester123', role: 'Tester' },
    { username: 'viewer', password: 'viewer123', role: 'Viewer' }
  ];

  for (const userData of usersData) {
    const existingUser = await User.findOne({ where: { username: userData.username } });
    if (!existingUser) {
      const hashedPwd = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({ username: userData.username, password: hashedPwd });
      const role = await Role.findOne({ where: { name: userData.role } });
      if (role) await newUser.addRole(role);
    }
  }
  console.log('✅ Users + user_roles seeded');

  // 3. Create Projects
  const admin = await User.findOne({ where: { username: 'admin' } });
  const projectsData = [
    { name: 'TeamTasker Core', description: 'Core features development', ownerId: admin!.id },
    { name: 'Client Dashboard', description: 'Dashboard for clients', ownerId: admin!.id }
  ];

  const projects = [];
  for (const p of projectsData) {
    const project = await Project.create(p);
    projects.push(project);
  }
  console.log('✅ Projects seeded');

  // 4. Create Tasks under Projects
  const dev = await User.findOne({ where: { username: 'dev' } });
  const tester = await User.findOne({ where: { username: 'tester' } });

  const tasksData = [
    {
      title: 'Design Database Schema',
      description: 'Plan and create the database schema for task tracking',
      projectId: projects[0].id,
      assignedTo: dev!.id,
      status: 'In Progress'
    },
    {
      title: 'Write Unit Tests',
      description: 'Write tests for project APIs',
      projectId: projects[1].id,
      assignedTo: tester!.id,
      status: 'Pending'
    }
  ];

  const tasks = [];
  for (const t of tasksData) {
    const task = await Task.create(t);
    tasks.push(task);
  }
  console.log('✅ Tasks seeded');

  // 5. Create Comments on tasks
 await Comment.create({
  text: 'Started working on DB schema.',
  taskId: tasks[0].id,
  userId: dev!.id
});

 await Comment.create({
  text: 'Please cover edge cases in tests.',
  taskId: tasks[1].id,
  userId: tester!.id
});

  console.log('✅ Comments seeded');
  console.log('🎉 Seeding complete!');
};