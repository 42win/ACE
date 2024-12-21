# ACE

![image](https://github.com/user-attachments/assets/b563661b-0ea2-4e81-9ff9-28f8684d8440)

## requirement
- node min version 12.22.9
- npm min version 8.5.1
- python min version 3.10.12
- pip min version 22.0.2

## Langkah instalasi

1. buka 2 terminal,
  - terminal 1 untuk menjalankan node.js 
  - terminal 2 untuk menjalankan python service
    
2. pada masing-masing terminal masuk ke direktori program

```bash
cd playgo_rev
```

3. pada terminal 2, buat environemt (jika belum ada) dan aktifkan enviroment

```bash
#buat environment
#python -m venv <nama_env>
python -m venv .venv

#aktivasi environemt
#windows
.venv\scripts\activate

#linux
Source .venv/bin/activate
```

4. instalasi library python
```bash
pip freeze > requirements_python.txt
```
5. selanjutnya jalankan go_minimax.py
```python
python3 go_minimax.py
```
6.  pada terminal 1, instalasi library yang dibutuhkan
```bash
npm install
```
7.  selanjutnya jalankan program
```bash
npm start
```
8. selanjutnya buka browser pada url localhost:8080 
   
