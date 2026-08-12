from flask import Flask, request, jsonify

app = Flask(__name__)

balances = {}


@app.route("/balance", methods=["GET"])
def get_balance():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    balance = balances.get(user_id, 0)

    return jsonify({
        "balance": balance
    })


@app.route("/balance", methods=["POST"])
def update_balance():
    data = request.get_json()

    user_id = data.get("user_id")
    amount = data.get("amount")

    if not user_id or amount is None:
        return jsonify({"error": "invalid data"}), 400

    balances[user_id] = balances.get(user_id, 0) + int(amount)

    return jsonify({
        "balance": balances[user_id]
    })


if __name__ == "__main__":
    print("🚀 Сервер запущен!")
    app.run(host="0.0.0.0", port=5000)