import fs from 'node:fs/promises';

// crio uma variável para guardar o caminho do arquivo do db no formato url.
const databasePath = new URL("../db.json", import.meta.url);

export class Database {
    // crio variável em memória
    #database = {};

    // ao iniciar a classe
    constructor(){
        // Leio o arquivo e coloco na variável em memória.
        fs.readFile(databasePath, 'utf-8')
            .then(data => {
                this.#database = JSON.parse(data);
            })
            // caso dê erro, faço o persiste que é criar o arquivo.
            .catch(() =>{
                this.#persist();
            })
    }

    /**
     * Crio arquivo do banco de dados e escrevo os dados atualizados.
     */
    #persist(){
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table, search){
        let data = this.#database[table] ?? [];

        if (search){
            data = data.filter(row => {
                return Object.entries(search).some(([key,value]) => {

                    console.log (` 
                    --------------------------------------------------------------------------------
                    OBJECT ENTRIES
                    key: ${key},
                    value: ${value}
                    `)
                    if (!value) return true;

                    return row[key].includes(value);
                })
            })
        }

        return data;
    }

    insert(table, data){
        // Verifico se tem a tabela
        if (Array.isArray(this.#database[table])){
            this.#database[table].push(data);
        // senão crio o array da tabela e coloco o dado.
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data;
    }

    update(table, id, data){
        const rowIndex = this.#database[table].findIndex(row => row.id == id);

        if (rowIndex > -1){

            // if(data.title){
            //     this.#database[table][rowIndex].title = data.title;
            // }

            // if (data.description){
            //     this.#database[table][rowIndex].description = data.description;
            // }

            // this.#database[table][rowIndex].updated_at = new Date();
            
            const row = this.#database[table][rowIndex];
            this.#database[table][rowIndex] = { id, ...row, ...data };

            this.#persist();
        }
    }

    delete(table, id){
        const rowIndex = this.#database[table].findIndex(row => row.id == id);

        if (rowIndex > -1){
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }
}

