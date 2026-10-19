// Adapts the original D1 contract to PostgreSQL without rewriting business rules.
export function translate(query){let n=0;return query.replace(/\b(gifts|assets|upload_tickets)\b/g,'loithuong.$1').replace(/\?/g,()=>'$'+(++n));}
export function database(sql){
 function statement(query,values=[]){const text=translate(query),exec=client=>client.unsafe(text,values);return {query,values,exec,bind(...params){return statement(query,params);},async first(){return (await exec(sql))[0]||null;},async all(){return {results:Array.from(await exec(sql))};},async run(){const rows=await exec(sql);return {meta:{changes:rows.count}};}};}
 return {prepare:query=>statement(query),async batch(statements){return sql.begin(async transaction=>{const out=[];for(const s of statements){const rows=await s.exec(transaction);out.push({results:Array.from(rows),meta:{changes:rows.count}});}return out;});}};
}
