# 圣鉴 ERP 登录滑块自动通过

Tampermonkey 油猴脚本：自动识别并拖动登录页的滑块拼图验证码。

算法移植自内部 UI 自动化项目里的 Selenium + OpenCV 求解器，把 OpenCV 的掩码模板匹配用纯 JavaScript 重写，因此不需要本地服务、Python 环境或任何外部接口。

## 适用范围

脚本只在下面三个登录页生效：

| 环境 | 登录页 |
| --- | --- |
| 开发服 | `https://erp.shengj.cn/#/login` |
| 测试服 | `https://test-pc.guandaojia.cn/#/login` |
| 正式服 | `https://gdj.shengj.cn/#/login` |

`@match` 覆盖三个域名的全部页面（前端是 hash 路由，`#/login` 不会出现在 match 规则里），但只有登录页弹出滑块时脚本才会动作。

三个环境是同一套前端构建（验证码组件的 scopeId 都是 `data-v-e44ef9f1`），行为一致。

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开安装链接：
   <https://raw.githubusercontent.com/Hazel-working/shengjian-slider-captcha/main/shengjian-slider-captcha.user.js>
3. Tampermonkey 弹出安装页后点「安装」。
4. 打开任一登录页，填账号密码点登录，滑块弹出后自动通过。

## 使用

- 默认开启。识别和拖拽时右下角会显示一行状态（几秒后自动消失），例如「滑块助手：已通过（202px，第 1 次）」。
- Tampermonkey 菜单里有「自动通过滑块：开 / 关」，开关状态会记住。
- 拖拽期间脚本会短暂拦截真实鼠标/触摸输入，此时你晃动鼠标不会干扰自动拖拽。
- 失败会自动重试：拖错后先等组件自动换题，2 秒内没换题就由脚本点击刷新按钮拉新题，再识别新题继续；还没拖拽的识别失败（图没画好、换题瞬间等）退避 1.5 秒后重试。

## 工作原理

1. 背景图和缺口图都是 base64 data URI，直接画进 canvas 读像素，不发起额外请求。
2. 以缺口图的 alpha 通道为掩码，在背景图上做掩码平方差匹配，等价于 OpenCV 的 `matchTemplate(bg, notch, TM_SQDIFF, mask=alpha)`，取最小值所在的 x。缺口图是整幅高度，所以只有一行结果。
3. 两道守卫拦截不可信结果：
   - 归一化得分（`SSD / (255² × 掩码像素数)`）大于 `0.30` 视为匹配失败；
   - 结果贴住最右一列且得分大于 `0.08` 也视为失败——多缺口图会把 SQDIFF 拉到右边界。
4. 守卫拒绝时，用 `TM_CCORR_NORMED` 与 `TM_CCOEFF_NORMED` 做交叉验证：两种指标必须各自唯一取到极值，且指向同一列，才采纳该列。掩码 CCOEFF 使用「按通道、仅掩码像素」的均值，这样能和 OpenCV 的分数逐位对齐。
5. 匹配到的 x 换算成 CSS 像素（`x × 显示宽度 / 图片宽度`），再用缓出曲线加随机间隔派发 `mousedown` / `mousemove` / `mouseup`。AJ-Captcha 的 `VerifySlide` 把 `mousemove` / `mouseup` 绑在 `window` 上，所以合成事件即可驱动。
6. 拖拽期间在 `window` 捕获阶段拦截所有真实鼠标/触摸事件（脚本自己派发的事件带有标记，正常放行）。否则手动晃动鼠标会混进同一条事件流，覆盖 `moveX`，甚至提前触发 `mouseup` 结束拖拽。
7. 拖完等组件给出结论：出现「验证成功」或弹窗关闭即通过。拖错后先等组件约 1 秒后自动换题；如果 2 秒内没换题，脚本会自动点击刷新按钮拉新题，再识别新题继续重试。换题后先等背景图和缺口图连续 60ms 签名不变、且两张图都解码完成再匹配，避免抓到换到一半的图。
8. 还没拖拽就失败的识别错误（图片未就绪、像素读取失败、匹配被守卫拒绝、识别途中换题等）不消耗服务端失败次数，退避 1.5 秒后自动重试，连续 5 次仍失败才停止。
9. 弹窗出现、换题、结果提示都由 `MutationObserver` 即时触发（500ms 兜底轮询），配合 60ms 的换题稳定窗口和每步 4–10ms 的拖拽节奏，从弹窗出现到开始拖拽通常在一百多毫秒内。

## 失败次数与安全边界

服务端连续第 5 次验证失败会锁账号，所以脚本刻意保守：

- 按「验证码弹窗会话」计，一次弹窗内脚本最多拖 2 次，给手动重试留 1 次；弹窗关闭后预算清零，下次登录重新开始；
- 同一道题只拖一次：拖错后等组件换到新题才继续，绝不重复拖同一道题；
- 优先等组件自己换题；2 秒内没换题才自动点刷新按钮，避免和组件的自动换题撞车、抓到半张图；
- 自动重试只针对还没拖拽的识别错误，这类失败不消耗服务端次数；退避重试最多 5 次；
- 拖拽期间暂时拦截真实鼠标/触摸输入，避免手动操作串进合成事件流；
- 任何异常都会在右下角红框里说明原因。

## 开发与测试

```bash
npm test              # 匹配算法离线回归，零依赖
npm install --include=dev
npm run test:browser  # 无头浏览器流程测试
```

`npm test` 用 `test/fixtures` 里两组真实样本：

- `background.png` / `notch.png` → 期望 118px，SQDIFF 直接通过守卫；
- `background_false_minimum.png` / `notch_false_minimum.png` → 期望 132px。这一组 SQDIFF 会落在右边界 263px（0.1320），必须靠交叉验证救回到 132px（CCORR 0.9744、CCOEFF 0.9029）。

期望值与 OpenCV 5.0 的输出逐项对齐，测试里也直接断言了两个相关系数。

`npm run test:browser` 用 `playwright-core` 驱动本机已安装的 Chrome/Edge（不会额外下载浏览器），在模拟的 AJ-Captcha 组件上跑完整流程：正常通过、拖拽时鼠标干扰、组件自动换题后重试、脚本自动点刷新后重试、两次失败后停止、停止后手动拖拽仍可用。当前实现实测从弹窗出现到开始拖拽约 150ms，改造前的 350ms 轮询版本约 650ms。测试找不到浏览器时可用 `CHROME_PATH` 指定；如果环境设置了 `NODE_ENV=production`，安装开发依赖需要加 `--include=dev`。

图标源文件是 `icon.svg`（手绘风格，不包含公司标识）。运行 `npm run make:icon` 会把它渲染成 64×64 PNG 并自动写回用户脚本的 `@icon`；加 `--preview` 还会生成深色/浅色底预览。

脚本本身是普通 IIFE：在 Node 里 `new Function(source)()` 执行时不会启动浏览器逻辑，只把纯算法挂到 `globalThis.__SHENGJIAN_SLIDER_CAPTCHA__` 供测试调用。

## 目录结构

```
shengjian-slider-captcha.user.js   油猴脚本（唯一交付物）
icon.svg                           手绘风格图标源文件
scripts/
  make-icon.mjs                    渲染图标并写回 @icon
test/
  matcher.test.mjs                 匹配算法回归测试
  browser.test.mjs                 无头浏览器流程测试
  browser-mock.js                  模拟 AJ-Captcha 组件
  png.mjs                          测试用的最小 PNG 解码器
  fixtures/                        真实验证码样本
package.json
```

## 免责声明

仅用于本系统自有环境的登录自动化与回归测试。请勿用于未授权的站点。

## License

MIT
