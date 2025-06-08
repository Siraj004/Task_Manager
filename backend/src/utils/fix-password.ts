import bcrypt from 'bcrypt';
import { User } from '../models';

async function resetPasswords() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);

  const adminResult = await User.update({ password: adminHash }, { where: { username: 'admin' } });
  const managerResult = await User.update({ password: managerHash }, { where: { username: 'manager' } });

  console.log('✅ Admin update:', adminResult);
  console.log('✅ Manager update:', managerResult);
  console.log('✅ Passwords reset to: admin123 / manager123');
  process.exit();
}

resetPasswords().catch(err => {
  console.error('❌ Error resetting passwords:', err);
  process.exit(1);
});
