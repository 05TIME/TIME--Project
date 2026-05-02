"""
@TIMEOai_Bot - Telegram Bot for $TIMEOE Causal Temporal Engine
Powered by xAI Grok

Setup:
1. pip install aiogram aiohttp python-dotenv
2. Create .env file with:
   - TELEGRAM_BOT_TOKEN=your_bot_token
   - TIMEOE_API_URL=https://your-app.vercel.app
   - TIMEOE_BOT_API_KEY=your_api_key
3. Run: python timeoai_bot.py
"""

import asyncio
import os
import logging
from typing import Optional
from datetime import datetime

import aiohttp
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.enums import ParseMode
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TIMEOE_API_URL = os.getenv("TIMEOE_API_URL", "http://localhost:3000")
TIMEOE_BOT_API_KEY = os.getenv("TIMEOE_BOT_API_KEY", "")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TIMEOai_Bot")

# Initialize bot and dispatcher
bot = Bot(token=TELEGRAM_BOT_TOKEN, parse_mode=ParseMode.MARKDOWN)
dp = Dispatcher()


# ============ API Client ============

async def call_timeoe_api(endpoint: str, data: dict = None, method: str = "POST") -> dict:
    """Call the $TIMEOE API endpoints."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TIMEOE_BOT_API_KEY}",
    }
    
    url = f"{TIMEOE_API_URL}/api/bot/{endpoint}"
    
    async with aiohttp.ClientSession() as session:
        try:
            if method == "GET":
                async with session.get(url, headers=headers, params=data) as resp:
                    return await resp.json()
            else:
                async with session.post(url, headers=headers, json=data) as resp:
                    return await resp.json()
        except Exception as e:
            logger.error(f"API call failed: {e}")
            return {"error": str(e)}


async def check_usage(user_id: int) -> dict:
    """Check user's remaining queries."""
    return await call_timeoe_api("usage", {"userId": str(user_id)}, method="GET")


async def increment_usage(user_id: int) -> dict:
    """Increment user's query count."""
    return await call_timeoe_api("usage", {"userId": str(user_id), "action": "increment"})


async def analyze_query(query: str, user_id: int, chat_id: int, mode: str = "quick") -> dict:
    """Send query to $TIMEOE for causal analysis."""
    return await call_timeoe_api("analyze", {
        "query": query,
        "userId": str(user_id),
        "chatId": str(chat_id),
        "mode": mode,
    })


# ============ Keyboards ============

def get_main_keyboard() -> InlineKeyboardMarkup:
    """Main action keyboard."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Quick Analysis", callback_data="mode_quick"),
            InlineKeyboardButton(text="Detailed", callback_data="mode_detailed"),
        ],
        [
            InlineKeyboardButton(text="My Usage", callback_data="usage"),
            InlineKeyboardButton(text="Upgrade", url="https://timeoe.app/pricing"),
        ],
    ])


def get_example_keyboard() -> InlineKeyboardMarkup:
    """Example queries keyboard."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Does X cause Y?", callback_data="ex_cause")],
        [InlineKeyboardButton(text="What if X changed?", callback_data="ex_counterfactual")],
        [InlineKeyboardButton(text="Find patterns in data", callback_data="ex_patterns")],
    ])


# ============ Handlers ============

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Handle /start command."""
    welcome = """
*Welcome to @TIMEOai\\_Bot*

I am the Telegram interface for the *$TIMEOE Causal Temporal Engine* powered by xAI Grok.

*What I can do:*
- Analyze causal relationships (Does X cause Y?)
- Run counterfactual simulations (What if?)
- Detect temporal patterns in data

*Commands:*
/analyze <query> - Quick causal analysis
/detailed <query> - Detailed analysis
/usage - Check your remaining queries
/examples - See example queries
/help - Show help

*Free tier:* 5 queries/day
*Pro tier:* 100 queries/day ($19/mo)

Just send me any causal question to get started!
"""
    await message.answer(welcome, reply_markup=get_main_keyboard())


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Handle /help command."""
    help_text = """
*$TIMEOE Bot Help*

*Analysis Commands:*
- /analyze <query> - Quick causal analysis
- /detailed <query> - Comprehensive analysis

*Account Commands:*
- /usage - Check remaining queries
- /upgrade - Get Pro access

*Example Queries:*
- "Does social media usage cause depression?"
- "What if interest rates doubled?"
- "Is there a causal link between sleep and productivity?"

*Tips:*
- Be specific about variables
- Include time context when relevant
- Ask clear cause-effect questions
"""
    await message.answer(help_text)


@dp.message(Command("usage"))
async def cmd_usage(message: types.Message):
    """Handle /usage command."""
    usage = await check_usage(message.from_user.id)
    
    if "error" in usage:
        await message.answer("Failed to fetch usage. Please try again.")
        return
    
    tier = usage.get("tier", "free").upper()
    used = usage.get("queriesUsed", 0)
    limit = usage.get("queryLimit", 5)
    remaining = usage.get("queriesRemaining", 0)
    total = usage.get("totalQueries", 0)
    
    text = f"""
*Your $TIMEOE Usage*

*Tier:* {tier}
*Today:* {used}/{limit} queries used
*Remaining:* {remaining}
*All-time:* {total} total queries

{"Upgrade to Pro for 100 queries/day!" if tier == "FREE" else "Thank you for being a Pro user!"}
"""
    await message.answer(text, reply_markup=get_main_keyboard())


@dp.message(Command("examples"))
async def cmd_examples(message: types.Message):
    """Handle /examples command."""
    text = """
*Example Causal Queries:*

*Causality:*
- "Does exercise cause weight loss?"
- "Is there a causal link between education and income?"

*Counterfactual:*
- "What if Bitcoin was never invented?"
- "What would happen if oil prices doubled?"

*Temporal:*
- "What patterns exist in stock market crashes?"
- "Are there seasonal cycles in consumer spending?"

Tap an example below or type your own:
"""
    await message.answer(text, reply_markup=get_example_keyboard())


@dp.message(Command("analyze"))
async def cmd_analyze(message: types.Message):
    """Handle /analyze command for quick analysis."""
    query = message.text.replace("/analyze", "").strip()
    
    if not query:
        await message.answer("Please provide a query.\n\nExample: `/analyze Does social media cause anxiety?`")
        return
    
    await process_query(message, query, mode="quick")


@dp.message(Command("detailed"))
async def cmd_detailed(message: types.Message):
    """Handle /detailed command for detailed analysis."""
    query = message.text.replace("/detailed", "").strip()
    
    if not query:
        await message.answer("Please provide a query.\n\nExample: `/detailed What if interest rates doubled?`")
        return
    
    await process_query(message, query, mode="detailed")


async def process_query(message: types.Message, query: str, mode: str = "quick"):
    """Process a causal analysis query."""
    user_id = message.from_user.id
    chat_id = message.chat.id
    
    # Check usage first
    usage = await check_usage(user_id)
    if not usage.get("canQuery", True):
        await message.answer(
            "*Daily limit reached!*\n\nYou've used all your free queries for today.\n\n"
            "Upgrade to Pro for 100 queries/day.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="Upgrade to Pro", url="https://timeoe.app/pricing")]
            ])
        )
        return
    
    # Send typing indicator
    await bot.send_chat_action(chat_id, "typing")
    
    # Increment usage
    await increment_usage(user_id)
    
    # Call analysis API
    result = await analyze_query(query, user_id, chat_id, mode)
    
    if result.get("success"):
        response = result.get("response", "Analysis complete.")
        tokens = result.get("usage", {}).get("tokens", 0)
        
        footer = f"\n\n_Powered by $TIMEOE + Grok | {tokens} tokens_"
        await message.answer(response + footer)
    else:
        await message.answer(
            "Analysis failed. Please try again.\n\n"
            f"Error: {result.get('error', 'Unknown error')}"
        )


# Handle plain text messages as queries
@dp.message(F.text & ~F.text.startswith("/"))
async def handle_text(message: types.Message):
    """Handle plain text messages as causal queries."""
    await process_query(message, message.text, mode="quick")


# ============ Callback Handlers ============

@dp.callback_query(F.data == "usage")
async def cb_usage(callback: types.CallbackQuery):
    """Handle usage button click."""
    usage = await check_usage(callback.from_user.id)
    
    tier = usage.get("tier", "free").upper()
    used = usage.get("queriesUsed", 0)
    limit = usage.get("queryLimit", 5)
    
    await callback.answer(f"{tier}: {used}/{limit} queries used today")


@dp.callback_query(F.data.startswith("mode_"))
async def cb_mode(callback: types.CallbackQuery):
    """Handle mode selection."""
    mode = callback.data.replace("mode_", "")
    await callback.answer(f"Send your query for {mode} analysis")
    await callback.message.answer(f"*{mode.capitalize()} Mode*\n\nSend me your causal question:")


@dp.callback_query(F.data.startswith("ex_"))
async def cb_example(callback: types.CallbackQuery):
    """Handle example query selection."""
    examples = {
        "ex_cause": "Does social media usage cause depression in teenagers?",
        "ex_counterfactual": "What would have happened to the economy if COVID never occurred?",
        "ex_patterns": "What temporal patterns exist in cryptocurrency market cycles?",
    }
    
    query = examples.get(callback.data, "")
    await callback.answer("Processing example...")
    
    # Create a fake message to process
    await process_query(callback.message, query, mode="quick")


# ============ Main ============

async def main():
    """Start the bot."""
    logger.info("Starting @TIMEOai_Bot...")
    logger.info(f"API URL: {TIMEOE_API_URL}")
    
    # Start polling
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
