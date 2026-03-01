# Agent 国家调研提示模板

将以下模板中的 `{COUNTRY_CODE}`、`{COUNTRY_NAME}` 替换后给 Agent 执行。

---

你需要更新 GSFR 的国家数据，目标国家：`{COUNTRY_NAME}` (`{COUNTRY_CODE}`)。

请按以下要求执行：

1. 仅使用权威来源（央行、监管机构、官方支付系统、官方统计机构）。
2. 输出并更新这三个文件中的该国记录：
   - `docs/country_detail_table.csv`（主表）
   - `docs/country_sources_table.csv`（来源明细）
   - `docs/country_research_board.csv`（任务状态）
3. 同步应用数据：
   - `app/src/data/countries.json` 对应国家对象
   - 如 `openfx_status` 变化，更新 `docs/openfx_status_table.csv` 和 `app/src/data/openfxMap.ts`
4. 更新字段时遵守枚举：
   - `openfx_status`: `active|just_launched|coming_soon|not_covered`
   - `fx_trade_convertible`: `yes|partial|no|unknown`
   - `fx_capital_control`: `open|partial|strict|unknown`
   - `digital_legal_status`: `legal|gray|prohibited|unknown`
   - `digital_stablecoin_status`: `regulated|allowed|restricted|prohibited|unknown`
5. 至少提供 3 条来源，并写入 `country_sources_table.csv`：
   - `source_type`
   - `source_institution`
   - `source_url`
   - `source_last_verified` (`YYYY-MM-DD`)
6. 完成后运行：
   - `npm run build`（目录 `app`）
7. 输出最终变更摘要：
   - 变更字段列表
   - 旧值 -> 新值
   - 新增/删除来源
   - 未能确认的字段及原因

---

建议 `source_type` 值：
- `regulation`
- `payments`
- `central_bank`
- `compliance`
- `shipping`
- `trade`
- `remittance`

