import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float', // stock abc 
      price_def: 'float', // stock def
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float', //upper bound
      lower_bound: 'float', // lower bound
      trigger_alert: 'float', // triger when two bounds are crossed
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio","lower_bound", "upper_bound", "trigger_alert"]'); // the graph would plat all the fields for ratio, lower_bound, upper_bound and trigger_alert
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg', // aggregates allow us to handle duplicate data here and consolidate into one data point
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
        this.table.update([
            DataManipulator.generateRow(this.props.data),
        ] as unknown as TableData);
    }
  }
}

export default Graph;
