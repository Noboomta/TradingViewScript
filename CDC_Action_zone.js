// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © piriya33
// Added Labels and alert conditions and other quality of life feature
// Updated compatability with pine script v4
// Based on improvements from "Kitti-Playbook Action Zone V.4.2.0.3 for Stock Market"

//@version=4
study("CDC ActionZone V3 2020", overlay=true, precision=6)
//****************************************************************************//
// CDC Action Zone is based on a simple EMA crossover 
// between [default] EMA12 and EMA26
// The zones are defined by the relative position of 
// price in relation to the two EMA lines
//****************************************************************************//
// Changelog 2020-04-21
// - Added description 

// ## CDC ActionZone V3 2020 ##
// This is an update to my earlier script, CDC ActionZone V2
// The two scripts works slightly differently with V3 reacting slightly faster. 
// The main update is focused around conforming the standard to Pine Script V4.

// ## How it works ##
// ActionZone is a very simple system, utilizing just two exponential moving 
// averages. The 'Zones' in which different 'actions' should be taken is 
// highlighted with different colors on the chart. Calculations for the zones 
// are based on the relative position of price to the two EMA lines and the 
// relationship between the two EMAs

// CDCActionZone is your barebones basic, tried and true, trend following system
// that is very simple to follow and has also proven to be relatively safe.

// ## How to use ##
// The basic method for using ActionZone is to follow the green/red color. 
// Buy when bar closes in green.
// Sell when bar closes in red.
// There is a small label to help with reading the buy and sell signal.
// Using it this way is safe but slow and is expected to have around 35-40% 
// accuracy, while yielding around 2-3 profit factors. The system works best
// on larger time frames. 

// The more advanced method uses the zones to switch between different 
// trading system and biases, or in conjunction with other indicators.

// example 1:
// Buy when blue and Bullish Divergence between price and RSI is visible, 
// if not Buy on Green and vise-versa
// [b]example 2:[/b]
// Set up a long-biased grid and trade long only when actionzone is in 
// green, yellow or orange. 
// change the bias to short when actionzone turns to te bearish side 
// (red, blue, aqua) 
// (Look at colors on a larger time frame)

// ## Note ##
// The price field is set to close by default. change to either HL2 or OHLC4 
// when using the system in intraday timeframes or on market that does not close 
// (ie. Cryptocurrencies)

 

//****************************************************************************//
// Define User Input Variables

xsrc = input(title="Source Data",type=input.source, defval=close)
xprd1 = input(title="Fast EMA period", type=input.integer, defval=12)
xprd2 = input(title="Slow EMA period", type=input.integer, defval=26)
xsmooth = input(title="Smoothing period", type=input.integer, defval=1)
xfixtf = input(title="** Fixed Time Frame", type=input.bool, defval=false)
xtf = input(title="** Fix to time frame)", type=input.resolution, defval="D")


//****************************************************************************//
//Calculate Indicators

xPrice = ema(xsrc,xsmooth)
ytf = xtf == "" ? timeframe.period : xtf
FastMA = xfixtf ? 
     ema(
         security(syminfo.tickerid,
             ytf,
             ema(xsrc,xprd1)),
         xsmooth):
     ema(xPrice,xprd1)
SlowMA = xfixtf ? 
     ema(
         security(syminfo.tickerid,
             ytf,
             ema(xsrc,xprd2)),
         xsmooth):
     ema(xPrice,xprd2)

Bull = FastMA > SlowMA
Bear = FastMA < SlowMA

//****************************************************************************//
// Define Color Zones

Green = Bull and xPrice>FastMA // Buy
Blue = Bear and xPrice>FastMA and xPrice>SlowMA //Pre Buy 2
LBlue = Bear and xPrice>FastMA and xPrice<SlowMA //Pre Buy 1

Red = Bear and xPrice < FastMA // Sell
Orange = Bull and xPrice < FastMA and xPrice < SlowMA // Pre Sell 2
Yellow = Bull and xPrice < FastMA and xPrice > SlowMA // Pre Sell 1

//****************************************************************************//
// Display color on chart

fillSW = input(title="Fill Bar Colors", type=input.bool, defval=true)
bColor = Green ? color.green : 
     Blue ? color.blue : 
     LBlue ? color.aqua : 
     Red ? color.red : 
     Orange ? color.orange : 
     Yellow ? color.yellow : 
     color.black
barcolor(color=fillSW? bColor : na)

//****************************************************************************//
// Display MA lines

fastSW = input(title="Fast MA On/Off", type=input.bool, defval=true)
slowSW = input(title="Slow MA On/Off", type=input.bool, defval=true)

FastL = plot(fastSW ? FastMA : na,"Fast EMA",color=color.red)
SlowL = plot(slowSW ? SlowMA : na,"Slow EMA",color=color.blue)
fillcolor = Bull ? color.green : Bear ? color.red : color.black
fill(FastL,SlowL,fillcolor)

//****************************************************************************//
// Define Buy and Sell condition
// This is only for thebasic usage of CDC Actionzone (EMA Crossover) 
// ie. Buy on first green bar and sell on first red bar

buycond = Green and Green[1]==0
sellcond = Red and Red[1]==0

bullish = barssince(buycond) < barssince(sellcond)
bearish = barssince(sellcond) < barssince(buycond)

buy= bearish[1]and buycond
sell= bullish[1] and sellcond

//****************************************************************************//
// Plot Buy and Sell point on chart

plotshape(buy, style=shape.circle,
     title = "Buy Signal",
     location = location.belowbar,
     color = color.green)

plotshape(sell, style=shape.circle,
     title = "Sell Signal",
     location=location.abovebar,
     color = color.red)

//****************************************************************************//
// Label

labelSwitch =  input(title="Label On/Off", type=input.bool, defval=true) 
labelstyle = close>SlowMA ? 
     label.style_labeldown : 
     label.style_labelup
labelyloc = close>SlowMA ? 
     yloc.abovebar : 
     yloc.belowbar
labeltcolor = xfixtf ? 
     color.white :
     buy ? color.black : 
     sell ? color.white :
     close > close[1] ? color.green : 
     color.red
labelbgcolor = xfixtf ? color.navy : 
     buy ? color.green : 
     sell ? color.red : 
     #e8e8e8
labeltext = buy ? 
     "BUY next bar\n" : 
     sell ? "SELL next bar\n" : 
     " "
labeltext_norm = labeltext + 
     syminfo.ticker +
     " : " + timeframe.period +
     "\n" + tostring(close)
labeltext_fixtf = "Fixed timeframe mode : ON \n" + 
     "Displaying ActionZone Signal from tf : " + ytf + "\n" +
     "from :" + syminfo.tickerid

l1 = label.new(bar_index,na,
     text=xfixtf == 0 ? labeltext_norm : labeltext_fixtf,
     color = labelbgcolor, 
     textcolor=labeltcolor, 
     yloc=labelyloc, 
     style=labelstyle)

label.delete(labelSwitch ? l1[1] : l1)

//****************************************************************************//
// Alert conditions

alertcondition(buy, 
     title="Buy Alert",
     message= "Buy {{exchange}}:{{ticker}}")
     
alertcondition(sell, 
     title="Sell Alert",
     message= "Sell {{exchange}}:{{ticker}}")

//****************************************************************************//