import React from 'react';
import { ChevronDown, Users, UserCheck, FileText, BookUser, Globe, Cake, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryReport = ({ 
  collapsedDetailedSummary, setCollapsedDetailedSummary,
  activeSummaryAccordion, setActiveSummaryAccordion,
  expandedProvinces, toggleProvinceCollapse,
  handleSummaryDrillDown, detailedSummary
}: any) => {

  return (
    <section id="detailed-summary-section" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
  <div 
              className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors print:bg-slate-100 print:text-black print:border-b"
              onClick={() => setCollapsedDetailedSummary(!collapsedDetailedSummary)}
            >
              <div className="flex items-center space-x-2">
                <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform ${collapsedDetailedSummary ? '-rotate-90' : 'rotate-0'}`} />
                <h2 className="text-lg font-bold uppercase tracking-wide">Danh Sách Tổng Hợp</h2>
              </div>
            </div>
            
            {!collapsedDetailedSummary && (
              <div className="p-4 space-y-1">
                {[
                  { key: 'rank', title: 'Thống kê theo Cấp bậc', data: detailedSummary.rank, icon: Users },
                  { key: 'position', title: 'Thống kê theo Chức vụ', data: detailedSummary.position, icon: UserCheck },
                  { key: 'enlistment', title: 'Thống kê theo Nhập ngũ', data: detailedSummary.enlistment, icon: FileText },
                  { key: 'unit', title: 'Thống kê theo Đơn vị', data: detailedSummary.unit, icon: Users },
                  { key: 'education', title: 'Thống kê theo Văn hóa', data: detailedSummary.education, icon: BookUser },
                  { key: 'ethnicity', title: 'Thống kê theo Dân tộc', data: detailedSummary.ethnicity, icon: Globe },
                  { key: 'dateOfBirth', title: 'Thống kê theo Năm sinh', data: detailedSummary.dateOfBirth, icon: Cake },
                  { key: 'religion', title: 'Thống kê theo Tôn giáo', data: detailedSummary.religion, icon: Users },
                  { key: 'residence', title: 'Thống kê theo Trú quán (Tỉnh)', data: detailedSummary.residence, icon: Globe },
                ].map(item => (
                  <div key={item.key} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => setActiveSummaryAccordion(activeSummaryAccordion === item.key ? null : item.key)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center space-x-3"
                    >
                      <item.icon className="w-4 h-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                    </div>
                    <AnimatePresence>
                      {activeSummaryAccordion === item.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3">
                            <table className="w-full text-sm">
                              <tbody>
                                {item.data.length > 0 ? (
                                  item.data.map(([value, count]: [string, any]) => (
                                    <tr 
                                      key={value} 
                                      className="border-b border-slate-200 last:border-b-0"
                                    >
                                      <td colSpan={2} className="p-0">
                                        <table className="w-full">
                                          <tbody>
                                            <tr className="hover:bg-slate-100">
                                              {item.key === 'residence' && typeof count === 'object' && Object.keys(count.districts).length > 0 ? (
                                                <>
                                                  <td className="py-1.5 px-3 text-slate-700 w-full cursor-pointer" onClick={() => handleSummaryDrillDown(item.key, value, item.title)}>
                                                    <div className="flex justify-between items-center">
                                                      <span>{value}</span>
                                                      <button onClick={(e) => { e.stopPropagation(); toggleProvinceCollapse(value); }} className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
                                                        {expandedProvinces.has(value) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                      </button>
                                                    </div>
                                                  </td>
                                                  <td className="py-1.5 px-3 text-right font-semibold text-slate-800 cursor-pointer" onClick={() => handleSummaryDrillDown(item.key, value, item.title)} >
                                                    {count.total > 0 ? `${count.total} đ/c` : ''}
                                                  </td>
                                                </>
                                              ) : (
                                                <>
                                                  <td className={`py-1.5 px-3 text-slate-700 cursor-pointer`} onClick={() => handleSummaryDrillDown(item.key, value, item.title)}>
                                                    {item.key === 'unit' ? (
                                                      <span className={`${value.startsWith("Trung đội") ? 'font-semibold' : ''} ${value.startsWith("Tiểu đội") ? 'pl-4' : ''}`}>{value}</span>
                                                    ) : ( value )}
                                                  </td>
                                                  <td className="py-1.5 px-3 text-right font-semibold text-slate-800 cursor-pointer" onClick={() => handleSummaryDrillDown(item.key, value, item.title)}>{typeof count === 'number' ? (count > 0 ? `${count} đ/c` : '') : (count.total > 0 ? `${count.total} đ/c` : '')}</td>
                                                </>
                                              )}
                                            </tr>
                                            <AnimatePresence>
                                              {item.key === 'residence' && typeof count === 'object' && count.districts && expandedProvinces.has(value) && (
                                                <motion.tr
                                                  initial={{ opacity: 0 }}
                                                  animate={{ opacity: 1 }}
                                                  exit={{ opacity: 0 }}
                                                  className="bg-slate-50"
                                                >
                                                  <td colSpan={2} className="pt-0 pb-1 px-1">
                                                    <div className="border-t border-slate-200 mx-2">
                                                      {Object.entries(count.districts).sort(([a], [b]) => a.localeCompare(b)).map(([district, districtCount]: [string, any]) => (
                                                        <div key={`${value}-${district}`} className="flex justify-between items-center hover:bg-sky-100 cursor-pointer rounded-md px-2 py-1" onClick={() => handleSummaryDrillDown(item.key, `${value}__SUB__${district}`, item.title)}>
                                                          <span className="pl-6 text-slate-600">{district}</span>
                                                          <span className="font-medium text-slate-700">{districtCount > 0 ? `${districtCount} đ/c` : ''}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </td>
                                                </motion.tr>
                                              )}
                                            </AnimatePresence>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr><td colSpan={2} className="text-slate-500 italic py-1.5">Chưa có dữ liệu.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
                )}
    </section>
  );
};

export default SummaryReport;