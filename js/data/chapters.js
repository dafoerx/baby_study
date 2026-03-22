/**
 * 课程章节总目录数据
 * 其他章节预留，暂时只实现第7章
 */
const CHAPTERS = [
  {
    id: 1,
    title: '第1章',
    subtitle: '认识数量 (1-10)',
    description: '通过点卡认识基础数量1到10',
    status: 'locked', // locked | available | completed
    icon: '🔒'
  },
  {
    id: 2,
    title: '第2章',
    subtitle: '认识数量 (11-20)',
    description: '扩展认识数量11到20',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 3,
    title: '第3章',
    subtitle: '认识数量 (21-50)',
    description: '进一步扩展到50的数量认知',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 4,
    title: '第4章',
    subtitle: '认识数量 (51-100)',
    description: '完成百以内数量的完整认知',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 5,
    title: '第5章',
    subtitle: '加法等式',
    description: '学习加法运算的点卡展示',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 6,
    title: '第6章',
    subtitle: '减法等式',
    description: '学习减法运算的点卡展示',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 7,
    title: '第7章',
    subtitle: '综合等式 (加减混合)',
    description: '加法与减法混合等式练习，每日4次，每次3组',
    status: 'available',
    icon: '📖',
    totalDays: 5
  },
  {
    id: 8,
    title: '第8章',
    subtitle: '乘法等式',
    description: '学习乘法运算的点卡展示',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 9,
    title: '第9章',
    subtitle: '除法等式',
    description: '学习除法运算的点卡展示',
    status: 'locked',
    icon: '🔒'
  },
  {
    id: 10,
    title: '第10章',
    subtitle: '综合运算',
    description: '四则运算综合练习',
    status: 'locked',
    icon: '🔒'
  }
];
