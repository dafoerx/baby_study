/**
 * 第7章数据 - 综合等式 (加减混合)
 * 
 * 规则：
 * - 每天4次(session)，每次3组(group)
 * - 两组间间隔15分钟（可调）
 * - 每组包含多个等式
 * - 等式如：95 - 62 = 33（红字卡，从左往右依次铺出）
 * - 点卡配色：红色圆点为主
 * 
 * 点卡颜色说明（同课件图片配色）：
 * - 红色(red): 主要数字点卡色
 * - 蓝色(blue): 辅助颜色  
 * - 绿色(green): 答案颜色
 * - 紫色(purple): 特殊标记
 */

const CHAPTER7_DATA = {
  id: 7,
  title: '第7章 - 综合等式 (加减混合)',
  description: '每日4次，每次3组，两组间间隔15分钟',
  sessionsPerDay: 4,    // 每天闪4次
  groupsPerSession: 3,  // 每次3组
  intervalMinutes: 15,  // 两组间隔15分钟
  defaultSpeed: 0.5,    // 默认0.5秒

  days: [
    // ======== 第1天 ========
    {
      day: 1,
      title: '第1天',
      description: '加减法混合入门',
      sessions: [
        {
          session: 1,
          groups: [
            {
              equations: [
                { parts: [25, '+', 10, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [48, '-', 13, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [30, '+', 22, '=', 52], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [67, '-', 34, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [15, '+', 28, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [80, '-', 45, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [42, '+', 18, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [93, '-', 51, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [11, '+', 36, '=', 47], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 2,
          groups: [
            {
              equations: [
                { parts: [55, '-', 20, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [18, '+', 42, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [76, '-', 33, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [29, '+', 31, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [84, '-', 42, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [37, '+', 13, '=', 50], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [61, '-', 28, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [24, '+', 46, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [99, '-', 57, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 3,
          groups: [
            {
              equations: [
                { parts: [43, '+', 27, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [88, '-', 46, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [16, '+', 54, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [72, '-', 39, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [35, '+', 25, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [91, '-', 48, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [22, '+', 38, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [65, '-', 30, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [14, '+', 56, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 4,
          groups: [
            {
              equations: [
                { parts: [51, '+', 19, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [78, '-', 35, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [33, '+', 27, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [95, '-', 62, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [26, '+', 44, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [87, '-', 52, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [41, '+', 29, '=', 70], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [66, '-', 24, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [19, '+', 41, '=', 60], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        }
      ]
    },

    // ======== 第2天 ========
    {
      day: 2,
      title: '第2天',
      description: '进阶混合运算',
      sessions: [
        {
          session: 1,
          groups: [
            {
              equations: [
                { parts: [38, '+', 47, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [71, '-', 29, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [56, '+', 24, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [93, '-', 48, '=', 45], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [27, '+', 63, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [82, '-', 37, '=', 45], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [44, '+', 36, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [69, '-', 25, '=', 44], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [31, '+', 49, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 2,
          groups: [
            {
              equations: [
                { parts: [58, '-', 23, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [45, '+', 35, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [96, '-', 54, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [33, '+', 57, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [74, '-', 41, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [28, '+', 52, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [87, '-', 45, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [39, '+', 41, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [62, '-', 27, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 3,
          groups: [
            {
              equations: [
                { parts: [46, '+', 34, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [83, '-', 38, '=', 45], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [21, '+', 59, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [75, '-', 32, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [52, '+', 38, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [68, '-', 26, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [34, '+', 46, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [91, '-', 56, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [47, '+', 43, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 4,
          groups: [
            {
              equations: [
                { parts: [63, '-', 28, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [42, '+', 48, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [85, '-', 43, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [29, '+', 51, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [77, '-', 34, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [53, '+', 37, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [94, '-', 52, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [36, '+', 44, '=', 80], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [81, '-', 46, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        }
      ]
    },

    // ======== 第3天 ========
    {
      day: 3,
      title: '第3天',
      description: '大数综合练习',
      sessions: [
        {
          session: 1,
          groups: [
            {
              equations: [
                { parts: [72, '+', 18, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [56, '-', 23, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [48, '+', 37, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [89, '-', 47, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [34, '+', 56, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [73, '-', 38, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [57, '+', 33, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [81, '-', 39, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [26, '+', 64, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 2,
          groups: [
            {
              equations: [
                { parts: [64, '-', 31, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [43, '+', 47, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [97, '-', 55, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [51, '+', 39, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [86, '-', 43, '=', 43], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [25, '+', 65, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [78, '-', 36, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [62, '+', 28, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [54, '-', 21, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 3,
          groups: [
            {
              equations: [
                { parts: [41, '+', 49, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [76, '-', 34, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [58, '+', 32, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [92, '-', 57, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [37, '+', 53, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [69, '-', 27, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [46, '+', 44, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [83, '-', 41, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [28, '+', 62, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 4,
          groups: [
            {
              equations: [
                { parts: [53, '+', 37, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [71, '-', 29, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [44, '+', 46, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [88, '-', 53, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [32, '+', 58, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [67, '-', 25, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [59, '+', 31, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [95, '-', 53, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [23, '+', 67, '=', 90], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        }
      ]
    },

    // ======== 第4天 ========
    {
      day: 4,
      title: '第4天',
      description: '混合等式强化',
      sessions: [
        {
          session: 1,
          groups: [
            {
              equations: [
                { parts: [95, '-', 62, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [47, '+', 38, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [73, '-', 31, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [28, '+', 57, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [86, '-', 44, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [39, '+', 46, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [64, '-', 29, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [52, '+', 33, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [91, '-', 49, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 2,
          groups: [
            {
              equations: [
                { parts: [43, '+', 42, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [78, '-', 36, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [56, '+', 29, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [97, '-', 55, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [34, '+', 51, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [82, '-', 47, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [61, '+', 24, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [75, '-', 33, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [48, '+', 37, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 3,
          groups: [
            {
              equations: [
                { parts: [69, '-', 27, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [53, '+', 32, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [84, '-', 42, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [27, '+', 58, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [93, '-', 58, '=', 35], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [41, '+', 44, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [76, '-', 34, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [58, '+', 27, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [67, '-', 25, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 4,
          groups: [
            {
              equations: [
                { parts: [35, '+', 50, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [88, '-', 46, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [46, '+', 39, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [71, '-', 29, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [62, '+', 23, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [94, '-', 52, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [57, '+', 28, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [83, '-', 41, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [29, '+', 56, '=', 85], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        }
      ]
    },

    // ======== 第5天 ========
    {
      day: 5,
      title: '第5天',
      description: '综合巩固复习',
      sessions: [
        {
          session: 1,
          groups: [
            {
              equations: [
                { parts: [66, '-', 33, '=', 33], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [45, '+', 50, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [87, '-', 42, '=', 45], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [38, '+', 57, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [79, '-', 37, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [54, '+', 41, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [92, '-', 50, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [63, '+', 32, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [76, '-', 34, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 2,
          groups: [
            {
              equations: [
                { parts: [47, '+', 48, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [85, '-', 43, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [31, '+', 64, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [73, '-', 31, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [59, '+', 36, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [96, '-', 54, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [42, '+', 53, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [68, '-', 26, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [55, '+', 40, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 3,
          groups: [
            {
              equations: [
                { parts: [81, '-', 39, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [36, '+', 59, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [74, '-', 32, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [51, '+', 44, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [89, '-', 47, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [28, '+', 67, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [65, '-', 23, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [43, '+', 52, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [97, '-', 55, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        },
        {
          session: 4,
          groups: [
            {
              equations: [
                { parts: [34, '+', 61, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [82, '-', 40, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [57, '+', 38, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [91, '-', 49, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [48, '+', 47, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [77, '-', 35, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            },
            {
              equations: [
                { parts: [62, '+', 33, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [84, '-', 42, '=', 42], colors: ['red', 'op', 'red', 'op', 'red'] },
                { parts: [26, '+', 69, '=', 95], colors: ['red', 'op', 'red', 'op', 'red'] },
              ]
            }
          ]
        }
      ]
    }
  ]
};
