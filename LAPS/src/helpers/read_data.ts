import csvParser from 'csv-parser';
import fs from 'fs';
import mongoose from 'mongoose';
import config from '../config.js';
import Laptop from '../models/laptop.model.js';


const DB = config.DB;

mongoose.connect(DB)
.then(connection=>{
    console.log('Database connection successful', connection.connections[0].name);
})
.catch(error => {
    console.error('Database connection error:', error);
});

const readData = async() =>{
    const Laptops: any[] = [];
    try{
        fs.createReadStream('./laptop.csv')
            .pipe(csvParser())
            .on('data', async (row) => {
                // choice for the missing values
                const laptopData = {
                    model_name: row['model_name'],
                    brand: row['brand'],
                    processor_name: row['processor_name'],
                    ram: parseInt(row['ram']),
                    ssd: parseInt(row['ssd']),
                    hard_disk: parseInt(row['hard_disk']),
                    operating_system: row['operating_system'],
                    graphics: row['graphics'],
                    screen_size_inches: parseFloat(row['screen_size']) || 0,
                    resolution_pixels: row['resolution'] || '0 x 0',
                    no_of_cores: parseInt(row['no_of_cores']),
                    no_of_threads: parseInt(row['no_of_threads']),
                    spec_score: parseFloat(row['spec_score']),
                    price: parseFloat(row['price']),
                };
                Laptops.push(laptopData);
            })
            .on('end', async () => {
                await Laptop.insertMany(Laptops);
                console.log(`${Laptops.length} laptops inserted successfully`);
                await mongoose.connection.close();
                try {
                    console.log('Data inserted successfully');
                } catch (insertError: any) {
                    console.error('Error inserting data:', insertError.message);
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
            });
    } catch(error) {
        console.error('Error reading data:', error);
    }
}

await readData();

// read headers
// let isFirstRow = true;

// fs.createReadStream('./laptop.csv')
//     .pipe(csvParser())
//     .on('data', (row) => {
//         if (isFirstRow) {
//             console.log(Object.keys(row));
//             isFirstRow = false;
//             return;
//         }
//     })
//     .on('end', () => {
//         console.log('Header successfully read');
//     })
//     .on('error', (error) => {
//         console.error('Error reading CSV file:', error);
//     });