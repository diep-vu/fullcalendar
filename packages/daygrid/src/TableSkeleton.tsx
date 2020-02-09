import {
  VNode, h,
  DateProfile,
  DateMarker,
  BaseComponent,
  RefMap,
  Ref
} from '@fullcalendar/core'
import DayBgRow from './DayBgRow'
import TableSkeletonDayCell from './TableSkeletonDayCell'


export interface TableSkeletonProps extends TableBaseProps {
  rowElRefs?: RefMap<HTMLDivElement>
  cellElRefs?: RefMap<HTMLTableCellElement>[]
}

export interface TableBaseProps {
  rootElRef?: Ref<HTMLDivElement>
  dateProfile: DateProfile
  cells: CellModel[][] // cells-BY-ROW
  isRigid: boolean
    // isRigid determines whether the individual rows should ignore the contents and be a constant height.
    // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  renderNumberIntro: (row: number, cells: any) => VNode[]
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
  colWeekNumbersVisible: boolean // week numbers render in own column? (caller does HTML via intro)
  cellWeekNumbersVisible: boolean // display week numbers in day cell?
  colGroupNode: VNode
  vGrow: boolean
}

export interface CellModel {
  date: DateMarker
  htmlAttrs?: object
}


export default class TableSkeleton extends BaseComponent<TableSkeletonProps> {


  render(props: TableSkeletonProps) {
    let rowCnt = this.props.cells.length
    let rowNodes: VNode[] = []

    for (let row = 0; row < rowCnt; row++) {
      rowNodes.push(
        this.renderDayRow(row)
      )
    }

    return (
      <div class={'fc-day-grid' + (props.vGrow ? ' vgrow' : '')} ref={props.rootElRef}>
        {rowNodes}
      </div>
    )
  }


  // Generates the HTML for a single row, which is a div that wraps a table.
  // `row` is the row number.
  renderDayRow(row) {
    let { theme } = this.context
    let { props } = this
    let classes = [ 'fc-row', 'fc-week', theme.getClass('bordered') ]

    if (props.isRigid) {
      classes.push('fc-rigid')
    }

    return (
      <div class={classes.join(' ')} ref={props.rowElRefs.createRef(row)}>
        <div class='fc-bg'>
          <table class={theme.getClass('table')}>
            {props.colGroupNode}
            <tbody>
              <DayBgRow
                cells={props.cells[row]}
                dateProfile={props.dateProfile}
                renderIntro={props.renderBgIntro}
                cellElRefs={props.cellElRefs[row]}
              />
            </tbody>
          </table>
        </div>
        <div class='fc-content-skeleton'>
          <table>
            {props.colGroupNode}
            {this.getIsNumbersVisible() &&
              <thead>
                {this.renderNumberTr(row)}
              </thead>
            }
          </table>
        </div>
      </div>
    )
  }


  getIsNumbersVisible() {
    let { props } = this

    return this.getIsDayNumbersVisible(props.cells.length) ||
      props.cellWeekNumbersVisible ||
      props.colWeekNumbersVisible
  }


  getIsDayNumbersVisible(rowCnt) {
    return rowCnt > 1
  }


  renderNumberTr(row: number) {
    let { props } = this
    let intro = props.renderNumberIntro(row, props.cells)

    return (
      <tr>
        {intro}
        {this.renderNumberCells(row)}
      </tr>
    )
  }


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  renderNumberCells(row) {
    let { cells, dateProfile, cellWeekNumbersVisible } = this.props
    let isDayNumbersVisible =this.getIsDayNumbersVisible(cells.length)
    let colCnt = cells[row].length
    let parts: VNode[] = []

    for (let col = 0; col < colCnt; col++) {
      parts.push(
        <TableSkeletonDayCell
          date={cells[row][col].date}
          dateProfile={dateProfile}
          isDayNumbersVisible={isDayNumbersVisible}
          cellWeekNumbersVisible={cellWeekNumbersVisible}
        />
      )
    }

    return parts
  }

}