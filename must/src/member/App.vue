<template>
  <div v-if="shell" class="wa">
    <div class="head"></div>
    <div id="nav1">
      <ul class="menusm">
        <li v-for="(item, index) in menu" :key="index" :class="topClass(item, index)"
            @mouseenter="hover = index" @mouseleave="hover = -1">
          <template v-if="item.separator"><img :src="'/ee/images/bb.png'"></template>
          <template v-else>
            <router-link v-if="item.to" :to="item.to" :class="linkClass(index)" :title="item.title">{{ item.label }}</router-link>
            <a v-else :href="item.href || ''" :class="linkClass(index)" :title="item.title" @click="open(item, $event)">{{ item.label }}</a>
            <ul v-if="item.children" class="children" :style="{ display: hover === index ? 'block' : 'none' }">
              <li v-for="(child, ci) in item.children" :key="ci" :class="{ ms_last: ci === item.children.length - 1, ms_first: ci === 0 }">
                <router-link v-if="child.to" :to="child.to" :title="child.title" @click.native="hover = -1">{{ child.label }}</router-link>
                <a v-else :href="child.href || ''" :title="child.title" @click="open(child, $event)">{{ child.label }}</a>
              </li>
            </ul>
          </template>
        </li>
      </ul>
    </div>
    <div class="nomo"></div>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" :style="bg.main">
      <tr>
        <td width="0" height="0" align="left" valign="top">
          <table width="80" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="8" align="left" valign="top" :style="bg.left"></td>
              <td width="1000" height="44" align="center" valign="top">
                <div class="con">
                  <div class="rug">
                    <div class="rug_02"><marquee direction="left" scrollamount="5" width="956" @mouseover="$event.target.stop()" @mouseout="$event.target.start()"><img :src="'/ee/images/fff.png'" width="22" height="13">{{ shell.marquee }}</marquee></div>
                  </div>
                  <div class="contt">
                    <div class="conttt">{{ shell.name }} 您好
                      歡迎再次光臨逢甲電機系系友會。
                      <hr>
                      <div class="nomo"><router-view :shell="shell"></router-view></div>
                    </div>
                  </div>
                </div>
              </td>
              <td width="8" align="left" :style="bg.right">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td height="0" align="center" valign="top"><img :src="'/ee/images/ff_08.jpg'" width="977" height="17"></td></tr>
    </table>
  </div>
  <p v-else-if="error" style="padding: 20px">{{ error }}</p>
</template>

<script>
import { memberApi } from './api';
import { errorText } from './util';

const sep = { separator: true };

export default {
  data() {
    // 以動態樣式引用同源圖片，避免建置時被當成本機檔案解析
    const bg = file => 'url(/ee/images/' + file + ')';
    return {
      shell: null, error: '', hover: -1,
      bg: {
        main: { background: bg('bg04_16.jpg') + ' repeat-y' },
        left: { background: bg('22_08.jpg') + ' no-repeat' },
        right: { background: bg('sh_11.jpg') + ' no-repeat' }
      }
    };
  },
  computed: {
    menu() {
      const s = this.shell;
      const affairs = [
        { label: '§ 系友會規章', title: '系友會規章', open: '/ee/File/Articles of Association 20090620.pdf' },
        { label: '§ 現任理監事', title: '現任理監事', open: '/ee/File/DirectorsandSupervisors.pdf' },
        { label: '§ 歷任理監事', title: '歷任理監事', open: '/ee/File/ex_DirectorsandSupervisors.pdf' },
        { label: '§ 會議記錄', title: '會議記錄', open: 'http://etouch.ee.fcu.edu.tw/wordpress/?page_id=88' },
        { label: '§ 系友會財務', title: '系友會財務', open: '/ee/File/Finance.pdf' },
        { label: '§ 歷屆捐款', title: '歷屆捐款', open: '/ee/File/Donation.pdf' },
        { label: '§ 活動相片', title: '活動相片', open: 'http://etouch.ee.fcu.edu.tw/photo/' },
        { label: '§ 系友會部落格', title: '系友會部落格', open: 'http://etouch.ee.fcu.edu.tw/wordpress/' }
      ];
      // 後台管理（issue 006）：僅管理員看到入口，頁面本身與 API 也在伺服器端檢查管理員身分
      const admin = [
        ['mail-single', '寄信件功能(單一)', '寄信件功能'], ['mail', '寄信件功能', '寄信件功能'],
        ['mail-jobs', '寄信功能', '寄信功能'],
        ['message-post', '公佈欄', '公佈欄'], ['confirm', '會員權限確認', '會員權限確認'],
        ['marquee', '跑馬燈', '跑馬燈'], ['change-log', '會員修改紀錄', '會員修改紀錄'],
        ['update-file', '發佈會務修改專區', '發佈會務修改專區'], ['sql-check', '資料庫檢查', '資料庫檢查']
      ].map(([path, label, title]) => ({ label: '§ ' + label, title, to: '/admin/' + path }));
      const items = [
        { label: '§ 首頁', title: '公佈欄', to: '/' }, sep,
        { label: '§ 會務專區', children: s.approved ? affairs : null }, sep,
        {
          label: '§ 系友資料', children: [
            { label: '§ 基本資料修改', title: '基本資料修改', to: '/basic' },
            { label: '§ 進階資料修改', title: '進階資料修改', to: '/advanced' },
            { label: '§ 經驗資料修改', title: '經驗資料修改', to: '/experience' },
            { label: '§ 系友資料查詢', title: '系友資料查詢', to: '/directory' },
            { label: '§ 數據統計', title: '數據統計', to: '/statistics' }
          ]
        }, sep,
        { label: '§ 工商服務平台', href: '/ee/Industry' }, sep,
        { label: '§ 留言板', title: '留言板', to: '/board' }
      ];
      if (s.isAdmin) items.push(sep, { label: '§ 後台管理', title: '後台管理', children: admin });
      items.push(sep, {
        label: '§ 隱私及操作', title: '隱私及操作', children: [
          { label: '§ 隱私權聲明', title: '隱私權聲明', open: '/ee/File/Privacy.pdf' },
          { label: '§ 填寫說明', title: '填寫說明', to: '/instruction' }
        ]
      }, sep, { label: '§ 登出', title: '登出', href: '/ee/logout.php' });
      return items;
    }
  },
  async created() {
    try {
      this.shell = (await memberApi.shell()).data;
    } catch (error) {
      this.error = errorText(error, '無法載入會員系統，請稍後再試。');
    }
  },
  methods: {
    topClass(item, index) {
      // 與舊選單的 menusm.js 相同：所有頂層 li（含分隔圖）都有 ms_top
      return {
        ms_top: true, ms_havesubmenu: !!item.children, ms_hover: this.hover === index,
        ms_first: index === 0, ms_last: index === this.menu.length - 1
      };
    },
    linkClass(index) {
      return { ms_top: true, ms_hover: this.hover === index };
    },
    open(item, event) {
      if (item.open) {
        event.preventDefault();
        window.open(item.open);
      } else if (!item.href) {
        event.preventDefault();
      }
    }
  }
};
</script>
