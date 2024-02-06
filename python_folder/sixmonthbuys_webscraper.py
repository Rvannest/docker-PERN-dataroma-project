
import requests
from bs4 import BeautifulSoup
import psycopg2

# Database connection parameters
db_params = {
    'dbname': '4150_Project',
    'user': 'postgres',
    'password': '1234',
    'host': 'localhost',
    'port': '5432'  # default PostgreSQL port is 5432
}

# Function to insert data into the database
def insert_data(data):
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    upsert_query = """
    INSERT INTO six_month_buys (
        symbol, 
        stock, 
        percent_portfolio, 
        buys, 
        hold_price, 
        current_price, 
        fifty_two_week_low, 
        percent_above_fifty_two_week_low, 
        fifty_two_week_high,
        is_stale
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, false
    )
    ON CONFLICT (symbol) DO UPDATE SET
        stock = EXCLUDED.stock,
        percent_portfolio = EXCLUDED.percent_portfolio,
        buys = EXCLUDED.buys,
        hold_price = EXCLUDED.hold_price,
        current_price = EXCLUDED.current_price,
        fifty_two_week_low = EXCLUDED.fifty_two_week_low,
        percent_above_fifty_two_week_low = EXCLUDED.percent_above_fifty_two_week_low,
        fifty_two_week_high = EXCLUDED.fifty_two_week_high,
        is_stale = false;
    """
    try:
        cursor.execute(upsert_query, data)
        conn.commit()
    except psycopg2.DatabaseError as error:
        print(f"Error: {error}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


def mark_records_as_stale():
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE six_month_buys SET is_stale = true;")
        conn.commit()
    except psycopg2.DatabaseError as error:
        print(f"Error: {error}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


def delete_stale_records():
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM six_month_buys WHERE is_stale = true;")
        conn.commit()
    except psycopg2.DatabaseError as error:
        print(f"Error: {error}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


mark_records_as_stale()

# The URL of the page you want to scrape
url = "https://www.dataroma.com/m/g/portfolio_b.php?q=h&o=c"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.5",
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    print("Connection successful (status code 200)")
    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table', id='grid')

    if table:
        rows = table.find_all('tr')[1:]  # Skip the header row
        for row in rows:
            columns = row.find_all('td')
            if columns and len(columns) == 9:  # Ensure there are enough columns
                symbol = columns[0].text.strip()
                stock = columns[1].text.strip()
                percent_portfolio = columns[2].text.strip().replace('%', '')
                buys = columns[3].text.strip()
                hold_price = columns[4].text.strip().replace('$', '').replace(',', '')
                current_price = columns[5].text.strip().replace('$', '').replace(',', '')
                fifty_two_week_low = columns[6].text.strip().replace('$', '').replace(',', '')
                percent_above_fifty_two_week_low = columns[7].text.strip().replace('%', '')
                fifty_two_week_high = columns[8].text.strip().replace('$', '').replace(',', '')

                # Create a tuple of the data
                data = (
                    symbol, 
                    stock, 
                    float(percent_portfolio) if percent_portfolio else None, 
                    int(buys) if buys else None, 
                    float(hold_price) if hold_price else None, 
                    float(current_price) if current_price else None, 
                    float(fifty_two_week_low) if fifty_two_week_low else None, 
                    float(percent_above_fifty_two_week_low) if percent_above_fifty_two_week_low else None, 
                    float(fifty_two_week_high) if fifty_two_week_high else None
                )

                # Insert data into the database
                insert_data(data)

else:
    print(f"Failed to connect to the website. Status code: {response.status_code}")

delete_stale_records()
