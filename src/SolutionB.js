import React from 'react';
import { Table } from 'antd';
import GrapheBipartite from './GrapheBipartite';

const SolutionB = ({ data, fixedRow, columns }) => {
   
    const dataWithFixedRow = [...data, fixedRow];

    // Filtrena le colonne car mety mis colonne tsy apotra 
    const filteredColumns = columns.slice(); 

    return (
        <div >
            <Table
                bordered
                dataSource={dataWithFixedRow}
                columns={filteredColumns}
                pagination={false}
            />
                
             <GrapheBipartite data={data} columns={columns} />  
        </div>
        //*liaisons entre ny permiere ligne et premiere colonne le graphe 
    );
};

export default SolutionB;
